import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './page.entity';
import { Link } from './link.entity';
import { SocialLink } from './social-link.entity';
import { PageStyle } from './page-style.entity';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, Link, SocialLink, PageStyle]),
    UsersModule,
  ],
  providers: [PagesService],
  controllers: [PagesController],
})
export class PagesModule {}
