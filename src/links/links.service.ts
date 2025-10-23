import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Link } from "./entities/link.entity";
import { CreateLinkDto } from "./dtos/create-link.dto";
import { UpdateLinkDto } from "./dtos/update-link.dto";
import { PagesService } from "../pages/pages.service";

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linksRepository: Repository<Link>,
    private pagesService: PagesService
  ) {}

  async create(createLinkDto: CreateLinkDto, userId: string): Promise<Link> {
    // Verificar se a página pertence ao usuário
    const canCreate = await this.pagesService.checkPageOwnership(
      createLinkDto.pageId,
      userId
    );
    if (!canCreate) {
      throw new ForbiddenException(
        "You do not have permission to add links to this page"
      );
    }

    // Validar URL
    this.validateUrl(createLinkDto.url);

    const link = this.linksRepository.create({
      ...createLinkDto,
      userId,
      order: createLinkDto.order || 0,
      target: createLinkDto.target || "_blank",
      isActive:
        createLinkDto.isActive !== undefined ? createLinkDto.isActive : true,
    });

    return this.linksRepository.save(link);
  }

  async findAllByUser(userId: string): Promise<Link[]> {
    return this.linksRepository.find({
      where: { userId },
      relations: ["page"],
      order: { order: "ASC", createdAt: "ASC" },
    });
  }

  async findAllByPage(pageId: string, userId: string): Promise<Link[]> {
    // Verificar se a página pertence ao usuário
    const canAccess = await this.pagesService.checkPageOwnership(
      pageId,
      userId
    );
    if (!canAccess) {
      throw new ForbiddenException(
        "You do not have permission to access links from this page"
      );
    }

    return this.linksRepository.find({
      where: { pageId, userId },
      order: { order: "ASC", createdAt: "ASC" },
    });
  }

  async findOne(id: string, userId: string): Promise<Link> {
    const link = await this.linksRepository.findOne({
      where: { id, userId },
      relations: ["page", "user"],
    });

    if (!link) {
      throw new NotFoundException("Link not found");
    }

    return link;
  }

  async update(
    id: string,
    updateLinkDto: UpdateLinkDto,
    userId: string
  ): Promise<Link> {
    const link = await this.findOne(id, userId);

    // Se estiver atualizando a página, verificar permissão
    if (updateLinkDto.pageId && updateLinkDto.pageId !== link.pageId) {
      const canUpdate = await this.pagesService.checkPageOwnership(
        updateLinkDto.pageId,
        userId
      );
      if (!canUpdate) {
        throw new ForbiddenException(
          "You do not have permission to move this link to the specified page"
        );
      }
    }

    // Validar URL se estiver sendo atualizada
    if (updateLinkDto.url) {
      this.validateUrl(updateLinkDto.url);
    }

    const updatedLink = this.linksRepository.merge(link, updateLinkDto);
    return this.linksRepository.save(updatedLink);
  }

  async remove(id: string, userId: string): Promise<void> {
    const link = await this.findOne(id, userId);
    await this.linksRepository.remove(link);
  }

  async updateOrder(
    links: { id: string; order: number }[],
    userId: string
  ): Promise<Link[]> {
    const updatedLinks: Link[] = [];

    for (const linkData of links) {
      const link = await this.linksRepository.findOne({
        where: { id: linkData.id, userId },
      });

      if (link) {
        link.order = linkData.order;
        updatedLinks.push(await this.linksRepository.save(link));
      }
    }

    return updatedLinks.sort((a, b) => a.order - b.order);
  }

  async findActiveLinksByPage(pageId: string): Promise<Link[]> {
    return this.linksRepository.find({
      where: {
        pageId,
        isActive: true,
      },
      order: { order: "ASC", createdAt: "ASC" },
    });
  }

  async incrementClickCount(linkId: string): Promise<void> {
    await this.linksRepository.increment({ id: linkId }, "clickCount", 1);
  }

  async getLinkStats(userId: string, pageId?: string): Promise<any> {
    let query = this.linksRepository
      .createQueryBuilder("link")
      .where("link.userId = :userId", { userId });

    if (pageId) {
      query = query.andWhere("link.pageId = :pageId", { pageId });
    }

    const stats = await query
      .select("SUM(link.clickCount)", "totalClicks")
      .addSelect("COUNT(link.id)", "totalLinks")
      .addSelect("AVG(link.clickCount)", "averageClicks")
      .getRawOne();

    return {
      totalClicks: parseInt(stats.totalClicks) || 0,
      totalLinks: parseInt(stats.totalLinks) || 0,
      averageClicks: parseFloat(stats.averageClicks) || 0,
    };
  }

  async findMostClickedLinks(
    userId: string,
    limit: number = 10
  ): Promise<Link[]> {
    return this.linksRepository.find({
      where: { userId },
      order: { clickCount: "DESC" },
      take: limit,
    });
  }

  private validateUrl(url: string): void {
    try {
      new URL(url);
    } catch (error) {
      throw new BadRequestException("Invalid URL format");
    }
  }

  // Método para buscar links por usuário com paginação
  async findLinksByUserWithPagination(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ links: Link[]; total: number }> {
    const [links, total] = await this.linksRepository.findAndCount({
      where: { userId },
      relations: ["page"],
      order: { order: "ASC", createdAt: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { links, total };
  }
}
