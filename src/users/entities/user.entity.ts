import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Page } from "../../pages/entities/page.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: "date" })
  birthDate: Date;

  @Column({ unique: true })
  googleId: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Page, (page) => page.user, { cascade: true })
  pages: Page[];

  getTotalPages(): number {
    if (!this.pages) return 0;
    return this.pages.length;
  }

  getActivePages(): Page[] {
    if (!this.pages) return [];
    return this.pages.filter((page) => page.isActive);
  }
}
