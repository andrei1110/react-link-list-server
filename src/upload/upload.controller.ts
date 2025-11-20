/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import type { Express } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('user-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    const url = await this.uploadService.uploadAvatar(file, 'users');
    return { success: true, data: url, message: 'Avatar uploaded' };
  }

  @Post('page-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPageAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    const url = await this.uploadService.uploadAvatar(file, 'pages');
    return { success: true, data: url, message: 'Avatar uploaded' };
  }
}
