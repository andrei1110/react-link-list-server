import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Link } from "../../links/entities/link.entity";

@Entity("pages")
export class Page {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ unique: true })
  permalink: string;

  @Column({ type: "text", nullable: true })
  bio: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "varchar", nullable: true, length: 7 })
  backgroundColor: string;

  @Column({ type: "varchar", nullable: true, length: 7 })
  textColor: string;

  @Column({ type: "varchar", nullable: true, length: 7 })
  buttonColor: string;

  @Column({ type: "varchar", nullable: true, length: 7 })
  buttonTextColor: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.pages, { onDelete: "CASCADE" })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Link, (link) => link.page, { cascade: true })
  links: Link[];

  getTotalClicks(): number {
    if (!this.links) return 0;
    return this.links.reduce(
      (total, link) => total + (link.clickCount || 0),
      0
    );
  }

  getActiveLinksCount(): number {
    if (!this.links) return 0;
    return this.links.filter((link) => link.isActive).length;
  }
}
