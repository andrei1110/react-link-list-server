import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Page } from './page.entity';

export enum SocialType {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  GITHUB = 'github',
  YOUTUBE = 'youtube',
  TIKTOK = 'tiktok',
}

@Entity()
export class SocialLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SocialType })
  type: SocialType;

  @Column()
  url: string;

  @Column({ nullable: true })
  icon: string; // se quiser um ícone custom

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => Page, (page) => page.socialLinks, { onDelete: 'CASCADE' })
  page: Page;
}
