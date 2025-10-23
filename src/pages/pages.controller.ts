import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
} from "@nestjs/common";
import { PagesService } from "./pages.service";
import { CreatePageDto } from "./dtos/create-page.dto";
import { UpdatePageDto } from "./dtos/update-page.dto";
import { PageStatsQueryDto } from "./dtos/page-stats-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Page } from "./entities/page.entity";

@Controller("pages")
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  async create(
    @Body() createPageDto: CreatePageDto,
    @Request() req
  ): Promise<Page> {
    return this.pagesService.create(createPageDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req): Promise<Page[]> {
    return this.pagesService.findAllByUser(req.user.id);
  }

  @Get("active")
  async findActive(@Request() req): Promise<Page[]> {
    return this.pagesService.findActivePagesByUser(req.user.id);
  }

  @Get("stats")
  async getStats(
    @Request() req,
    @Query() query: PageStatsQueryDto,
    @Query("pageId") pageId?: string
  ) {
    return this.pagesService.getPageStats(req.user.id, pageId);
  }

  @Get("search")
  async search(
    @Request() req,
    @Query("q") searchTerm: string
  ): Promise<Page[]> {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }
    return this.pagesService.searchPages(req.user.id, searchTerm.trim());
  }

  @Get("validate-permalink/:permalink")
  async validatePermalink(
    @Param("permalink") permalink: string,
    @Request() req
  ) {
    return this.pagesService.validatePermalink(permalink, req.user.id);
  }

  @Get(":id")
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req
  ): Promise<Page> {
    return this.pagesService.findOne(id, req.user.id);
  }

  @Put(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updatePageDto: UpdatePageDto,
    @Request() req
  ): Promise<Page> {
    return this.pagesService.update(id, updatePageDto, req.user.id);
  }

  @Delete(":id")
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req
  ): Promise<void> {
    return this.pagesService.remove(id, req.user.id);
  }

  @Post(":id/duplicate")
  async duplicate(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req
  ): Promise<Page> {
    return this.pagesService.duplicatePage(id, req.user.id);
  }

  @Put(":id/toggle-active")
  async toggleActive(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req
  ): Promise<Page> {
    const page = await this.pagesService.findOne(id, req.user.id);
    const updateDto: UpdatePageDto = { isActive: !page.isActive };
    return this.pagesService.update(id, updateDto, req.user.id);
  }
}
