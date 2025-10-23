import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Res,
  Header,
} from "@nestjs/common";
import { PagesService } from "./pages.service";
import { LinksService } from "../links/links.service";
import { Response } from "express";

@Controller("public/pages")
export class PublicController {
  constructor(
    private readonly pagesService: PagesService,
    private readonly linksService: LinksService
  ) {}

  @Get(":permalink")
  @Header("Cache-Control", "public, max-age=300") // Cache de 5 minutos
  async getPage(@Param("permalink") permalink: string) {
    const page = await this.pagesService.findByPermalink(permalink);

    if (!page) {
      throw new NotFoundException("Page not found");
    }

    // Buscar links ativos ordenados
    const links = await this.linksService.findActiveLinksByPage(page.id);

    return {
      page: {
        id: page.id,
        title: page.title,
        subtitle: page.subtitle,
        permalink: page.permalink,
        bio: page.bio,
        profileImage: page.profileImage,
        backgroundColor: page.backgroundColor,
        textColor: page.textColor,
        buttonColor: page.buttonColor,
        buttonTextColor: page.buttonTextColor,
        user: {
          id: page.user.id,
          name: page.user.name,
          avatar: page.user.avatar,
        },
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      },
      links: links.map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        description: link.description,
        icon: link.icon,
        target: link.target,
        order: link.order,
        backgroundColor: link.backgroundColor,
        textColor: link.textColor,
        clickCount: link.clickCount,
      })),
    };
  }

  @Get(":permalink/links/:linkId/click")
  async trackLinkClick(
    @Param("permalink") permalink: string,
    @Param("linkId") linkId: string,
    @Res() res: Response
  ) {
    const page = await this.pagesService.findByPermalink(permalink);

    if (!page) {
      throw new NotFoundException("Page not found");
    }

    // Buscar o link específico
    const links = await this.linksService.findActiveLinksByPage(page.id);
    const targetLink = links.find((l) => l.id === linkId);

    if (!targetLink) {
      throw new NotFoundException("Link not found");
    }

    // Incrementar contador de cliques
    await this.linksService.incrementClickCount(linkId);

    // Redirecionar para a URL do link
    return res.redirect(targetLink.url);
  }

  @Get("user/:userId")
  @Header("Cache-Control", "public, max-age=300")
  async getUserPublicPages(@Param("userId") userId: string) {
    const pages = await this.pagesService.findPublicPagesByUser(userId);

    return {
      pages: pages.map((page) => ({
        id: page.id,
        title: page.title,
        subtitle: page.subtitle,
        permalink: page.permalink,
        profileImage: page.profileImage,
        linksCount: page.links?.length || 0,
        createdAt: page.createdAt,
      })),
    };
  }
}
