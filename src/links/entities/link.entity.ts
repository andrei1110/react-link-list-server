import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Page } from "../../pages/entities/page.entity";

@Entity("links")
export class Link {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: "_blank" })
  target: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  clickCount: number;

  @Column({ type: "varchar", nullable: true, length: 10 })
  backgroundColor: string;

  @Column({ type: "varchar", nullable: true, length: 10 })
  textColor: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.pages, { onDelete: "CASCADE" })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Page, (page) => page.links, { onDelete: "CASCADE" })
  page: Page;

  @Column()
  pageId: string;
}
