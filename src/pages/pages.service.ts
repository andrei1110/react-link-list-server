import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { Page } from "./entities/page.entity";
import { CreatePageDto } from "./dtos/create-page.dto";
import { UpdatePageDto } from "./dtos/update-page.dto";

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pagesRepository: Repository<Page>
  ) {}

  async create(createPageDto: CreatePageDto, userId: string): Promise<Page> {
    const existingPage = await this.findByPermalink(createPageDto.permalink);
    if (existingPage) {
      throw new ConflictException("Permalink already in use");
    }

    const userExistingPage = await this.pagesRepository.findOne({
      where: {
        userId,
        permalink: createPageDto.permalink,
      },
    });

    if (userExistingPage) {
      throw new ConflictException(
        "You already have a page with this permalink"
      );
    }

    const page = this.pagesRepository.create({
      ...createPageDto,
      userId,
      isActive:
        createPageDto.isActive !== undefined ? createPageDto.isActive : true,
    });

    return this.pagesRepository.save(page);
  }

  async findAllByUser(userId: string): Promise<Page[]> {
    return this.pagesRepository.find({
      where: { userId },
      relations: ["links"],
      order: { createdAt: "DESC" },
    });
  }

  async findActivePagesByUser(userId: string): Promise<Page[]> {
    return this.pagesRepository.find({
      where: { userId, isActive: true },
      relations: ["links"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string, userId: string): Promise<Page> {
    const page = await this.pagesRepository.findOne({
      where: { id, userId },
      relations: ["links", "user"],
    });

    if (!page) {
      throw new NotFoundException("Page not found");
    }

    return page;
  }

  async findByPermalink(permalink: string): Promise<Page | null> {
    return this.pagesRepository.findOne({
      where: { permalink, isActive: true },
      relations: ["links", "user"],
    });
  }

  async findById(id: string): Promise<Page | null> {
    return this.pagesRepository.findOne({
      where: { id },
      relations: ["links", "user"],
    });
  }

  async update(
    id: string,
    updatePageDto: UpdatePageDto,
    userId: string
  ): Promise<Page> {
    const page = await this.findOne(id, userId);

    if (updatePageDto.permalink && updatePageDto.permalink !== page.permalink) {
      const existingPage = await this.findByPermalink(updatePageDto.permalink);
      if (existingPage && existingPage.id !== id) {
        throw new ConflictException("Permalink already in use");
      }

      const userExistingPage = await this.pagesRepository.findOne({
        where: {
          userId,
          permalink: updatePageDto.permalink,
          id: Not(id),
        },
      });

      if (userExistingPage) {
        throw new ConflictException(
          "You already have another page with this permalink"
        );
      }
    }

    const updatedPage = this.pagesRepository.merge(page, updatePageDto);
    return this.pagesRepository.save(updatedPage);
  }

  async remove(id: string, userId: string): Promise<void> {
    const page = await this.findOne(id, userId);
    await this.pagesRepository.remove(page);
  }

  async checkPageOwnership(pageId: string, userId: string): Promise<boolean> {
    const page = await this.pagesRepository.findOne({
      where: { id: pageId, userId },
    });
    return !!page;
  }

  async findPublicPagesByUser(userId: string): Promise<Page[]> {
    return this.pagesRepository.find({
      where: { userId, isActive: true },
      relations: ["links"],
      order: { createdAt: "DESC" },
    });
  }

  async getPageStats(userId: string, pageId?: string): Promise<any> {
    let query = this.pagesRepository
      .createQueryBuilder("page")
      .leftJoin("page.links", "link")
      .where("page.userId = :userId", { userId });

    if (pageId) {
      query = query.andWhere("page.id = :pageId", { pageId });
    }

    const stats = await query
      .select("COUNT(DISTINCT page.id)", "totalPages")
      .addSelect("COUNT(link.id)", "totalLinks")
      .addSelect("SUM(link.clickCount)", "totalClicks")
      .addSelect("AVG(link.clickCount)", "averageClicksPerLink")
      .getRawOne();

    const mostPopularPage = await this.pagesRepository
      .createQueryBuilder("page")
      .leftJoin("page.links", "link")
      .where("page.userId = :userId", { userId })
      .andWhere("page.isActive = :isActive", { isActive: true })
      .select("page.title", "title")
      .addSelect("page.permalink", "permalink")
      .addSelect("SUM(link.clickCount)", "totalClicks")
      .groupBy("page.id, page.title, page.permalink")
      .orderBy("SUM(link.clickCount)", "DESC")
      .limit(1)
      .getRawOne();

    return {
      totalPages: parseInt(stats.totalPages) || 0,
      totalLinks: parseInt(stats.totalLinks) || 0,
      totalClicks: parseInt(stats.totalClicks) || 0,
      averageClicksPerLink: parseFloat(stats.averageClicksPerLink) || 0,
      mostPopularPage: mostPopularPage || null,
    };
  }

  async duplicatePage(pageId: string, userId: string): Promise<Page> {
    const originalPage = await this.findOne(pageId, userId);

    let newPermalink = `${originalPage.permalink}-copy`;
    let counter = 1;

    while (await this.findByPermalink(newPermalink)) {
      newPermalink = `${originalPage.permalink}-copy-${counter}`;
      counter++;
    }

    const newPage = this.pagesRepository.create({
      title: `${originalPage.title} (Copy)`,
      subtitle: originalPage.subtitle,
      permalink: newPermalink,
      bio: originalPage.bio,
      profileImage: originalPage.profileImage,
      backgroundColor: originalPage.backgroundColor,
      textColor: originalPage.textColor,
      buttonColor: originalPage.buttonColor,
      buttonTextColor: originalPage.buttonTextColor,
      isActive: false,
      userId,
    });

    return this.pagesRepository.save(newPage);
  }

  async searchPages(userId: string, searchTerm: string): Promise<Page[]> {
    return this.pagesRepository
      .createQueryBuilder("page")
      .where("page.userId = :userId", { userId })
      .andWhere(
        "(page.title ILIKE :searchTerm OR page.subtitle ILIKE :searchTerm OR page.permalink ILIKE :searchTerm)",
        { searchTerm: `%${searchTerm}%` }
      )
      .leftJoinAndSelect("page.links", "links")
      .orderBy("page.createdAt", "DESC")
      .getMany();
  }

  async updatePageOrder(
    pages: { id: string; order: number }[],
    userId: string
  ): Promise<Page[]> {
    const updatedPages: Page[] = [];

    for (const pageData of pages) {
      const page = await this.pagesRepository.findOne({
        where: { id: pageData.id, userId },
      });

      if (page) {
        // page.order = pageData.order;
        updatedPages.push(await this.pagesRepository.save(page));
      }
    }

    return updatedPages;
  }

  async validatePermalink(
    permalink: string,
    userId?: string
  ): Promise<{ available: boolean; message?: string }> {
    const existingPage = await this.findByPermalink(permalink);

    if (existingPage) {
      return {
        available: false,
        message: "Permalink already in use",
      };
    }

    if (userId) {
      const userExistingPage = await this.pagesRepository.findOne({
        where: { userId, permalink },
      });

      if (userExistingPage) {
        return {
          available: false,
          message: "You already have a page with this permalink",
        };
      }
    }

    return { available: true };
  }

  async findByIdInternal(id: string): Promise<Page | null> {
    return this.pagesRepository.findOne({
      where: { id },
      relations: ["links", "user"],
    });
  }
}
