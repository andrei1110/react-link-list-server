import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Page } from './page.entity';

@Entity()
export class PageStyle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '#ffffff' })
  backgroundColor: string;

  @Column({ default: '#000000' })
  textColor: string;

  @Column({ default: '#000000' })
  buttonColor: string;

  @Column({ default: 'system-ui' })
  fontFamily: string;

  @OneToOne(() => Page, (page) => page.style)
  page: Page;
}
