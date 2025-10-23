import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PagesService } from "./pages.service";
import { PagesController } from "./pages.controller";
import { PublicController } from "./public.controller";
import { Page } from "./entities/page.entity";
import { LinksModule } from "../links/links.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Page]),
    LinksModule, // Importar LinksModule para usar LinksService
  ],
  controllers: [PagesController, PublicController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
