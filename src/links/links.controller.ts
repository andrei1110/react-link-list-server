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
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { LinksService } from "./links.service";
import { CreateLinkDto } from "./dtos/create-link.dto";
import { UpdateLinkDto } from "./dtos/update-link.dto";
import { UpdateLinkOrderDto } from "./dtos/update-link-order.dto";
import { LinkStatsQueryDto } from "./dtos/link-stats-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Link } from "./entities/link.entity";

@Controller("links")
@UseGuards(JwtAuthGuard)
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  async create(
    @Body() createLinkDto: CreateLinkDto,
    @Request() req
  ): Promise<Link> {
    return this.linksService.create(createLinkDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req): Promise<Link[]> {
    return this.linksService.findAllByUser(req.user.id);
  }

  @Get("paginated")
  async findAllPaginated(
    @Request() req,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.linksService.findLinksByUserWithPagination(
      req.user.id,
      page,
      limit
    );
  }

  @Get("page/:pageId")
  async findAllByPage(
    @Param("pageId") pageId: string,
    @Request() req
  ): Promise<Link[]> {
    return this.linksService.findAllByPage(pageId, req.user.id);
  }

  @Get("stats")
  async getStats(@Request() req, @Query() query: LinkStatsQueryDto) {
    return this.linksService.getLinkStats(req.user.id, query.pageId);
  }

  @Get("most-clicked")
  async getMostClicked(
    @Request() req,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.linksService.findMostClickedLinks(req.user.id, limit);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req): Promise<Link> {
    return this.linksService.findOne(id, req.user.id);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateLinkDto: UpdateLinkDto,
    @Request() req
  ): Promise<Link> {
    return this.linksService.update(id, updateLinkDto, req.user.id);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Request() req): Promise<void> {
    return this.linksService.remove(id, req.user.id);
  }

  @Put("reorder/order")
  async updateOrder(
    @Body() updateLinkOrderDto: UpdateLinkOrderDto,
    @Request() req
  ): Promise<Link[]> {
    return this.linksService.updateOrder(updateLinkOrderDto.links, req.user.id);
  }
}
