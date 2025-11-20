import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Link } from './link.entity';
import { SocialLink } from './social-link.entity';
import { PageStyle } from './page-style.entity';

@Entity()
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @ManyToOne(() => User, (user) => user.pages, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Link, (link) => link.page, { cascade: true })
  links: Link[];

  @OneToMany(() => SocialLink, (social) => social.page, { cascade: true })
  socialLinks: SocialLink[];

  @OneToOne(() => PageStyle, (style) => style.page, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  style: PageStyle;
}
