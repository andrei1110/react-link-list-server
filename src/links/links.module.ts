import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LinksService } from "./links.service";
import { LinksController } from "./links.controller";
import { Link } from "./entities/link.entity";
import { PagesModule } from "../pages/pages.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Link]),
    PagesModule, // Importar PagesModule para usar PagesService
  ],
  controllers: [LinksController],
  providers: [LinksService],
  exports: [LinksService],
})
export class LinksModule {}
