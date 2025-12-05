import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
  Patch,
  Delete,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import type { Req as ReqType } from 'src/types/req';

@Controller('pages')
export class PagesController {
  constructor(private pagesService: PagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: ReqType, @Body() dto: CreatePageDto) {
    return {
      success: true,
      data: await this.pagesService.create(req.user.userId, dto),
      message: 'Page created',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myPages(@Req() req: ReqType) {
    return {
      success: true,
      data: await this.pagesService.findAllByUser(req.user.userId),
      message: 'User pages success found',
    };
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return {
      success: true,
      data: await this.pagesService.findBySlug(slug),
      message: 'Page found',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: ReqType,
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
  ) {
    return {
      success: true,
      data: await this.pagesService.update(id, req.user.userId, dto),
      message: 'Page updated',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req: ReqType, @Param('id') id: string) {
    return {
      success: true,
      data: await this.pagesService.remove(id, req.user.userId),
      message: 'Page deleted',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.pagesService.findOne(id),
      message: 'Page found',
    };
  }
}
