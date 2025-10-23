import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PagesModule } from "./pages/pages.module";
import { LinksModule } from "./links/links.module";
import { User } from "./users/entities/user.entity";
import { Page } from "./pages/entities/page.entity";
import { Link } from "./links/entities/link.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get("DATABASE_URL"),
        entities: [User, Page, Link],
        synchronize: configService.get("NODE_ENV") !== "production",
        ssl:
          configService.get("NODE_ENV") === "production"
            ? {
                rejectUnauthorized: false,
              }
            : false,
        logging: configService.get("NODE_ENV") === "development",
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PagesModule,
    LinksModule, // Certifique-se que LinksModule está aqui
  ],
})
export class AppModule {}
