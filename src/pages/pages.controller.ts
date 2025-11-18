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

@Controller('pages')
export class PagesController {
  constructor(private pagesService: PagesService) {}

  // Criar página (auth)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreatePageDto) {
    return this.pagesService.create(req.user.userId, dto);
  }

  // Listar páginas do usuário logado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  myPages(@Req() req: any) {
    return this.pagesService.findAllByUser(req.user.userId);
  }

  // Atualizar página do usuário
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, req.user.userId, dto);
  }

  // Remover página
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.pagesService.remove(id, req.user.userId);
  }

  // Endpoint público -> usado pelo frontend tipo /:slug (igual ao seu andreitoledo.com.br)
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }
}
