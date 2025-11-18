import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './page.entity';
import { Link } from './link.entity';
import { SocialLink } from './social-link.entity';
import { PageStyle } from './page-style.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page) private pageRepo: Repository<Page>,
    @InjectRepository(Link) private linkRepo: Repository<Link>,
    @InjectRepository(SocialLink) private socialRepo: Repository<SocialLink>,
    @InjectRepository(PageStyle) private styleRepo: Repository<PageStyle>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreatePageDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const style = dto.style
      ? this.styleRepo.create(dto.style)
      : this.styleRepo.create({});
    const links = (dto.links || []).map((l) => this.linkRepo.create(l));
    const socialLinks = (dto.socialLinks || []).map((s) =>
      this.socialRepo.create(s),
    );

    const page = this.pageRepo.create({
      slug: dto.slug,
      title: dto.title,
      description: dto.description,
      user,
      style,
      links,
      socialLinks,
    });

    return this.pageRepo.save(page);
  }

  async findBySlug(slug: string) {
    const page = await this.pageRepo.findOne({
      where: { slug },
      relations: ['user', 'links', 'socialLinks', 'style'],
      order: {
        links: { order: 'ASC' },
        socialLinks: { order: 'ASC' },
      },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async findAllByUser(userId: string) {
    return this.pageRepo.find({
      where: { user: { id: userId } },
      relations: ['style'],
    });
  }

  async update(pageId: string, userId: string, dto: UpdatePageDto) {
    const page = await this.pageRepo.findOne({
      where: { id: pageId, user: { id: userId } },
      relations: ['links', 'socialLinks', 'style'],
    });

    if (!page) throw new NotFoundException('Page not found');

    if (dto.title !== undefined) page.title = dto.title;
    if (dto.description !== undefined) page.description = dto.description;
    if (dto.slug !== undefined) page.slug = dto.slug;

    if (dto.style) {
      Object.assign(page.style, dto.style);
    }

    if (dto.links) {
      await this.linkRepo.delete({ page: { id: page.id } as any });
      page.links = dto.links.map((l) => this.linkRepo.create(l));
    }

    if (dto.socialLinks) {
      await this.socialRepo.delete({ page: { id: page.id } as any });
      page.socialLinks = dto.socialLinks.map((s) => this.socialRepo.create(s));
    }

    return this.pageRepo.save(page);
  }

  async remove(pageId: string, userId: string) {
    const page = await this.pageRepo.findOne({
      where: { id: pageId, user: { id: userId } },
    });
    if (!page) throw new NotFoundException('Page not found');
    await this.pageRepo.remove(page);
    return { success: true };
  }
}
