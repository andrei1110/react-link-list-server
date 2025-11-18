import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PagesModule } from './pages/pages.module';
import { User } from './users/user.entity';
import { Page } from './pages/page.entity';
import { Link } from './pages/link.entity';
import { SocialLink } from './pages/social-link.entity';
import { PageStyle } from './pages/page-style.entity';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [User, Page, Link, SocialLink, PageStyle],
    }),
    UsersModule,
    AuthModule,
    PagesModule,
  ],
})
export class AppModule {}
