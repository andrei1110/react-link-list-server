import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Page } from './page.entity';

@Entity()
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string; // texto do botão

  @Column()
  url: string;

  @Column({ nullable: true })
  icon: string; // nome do ícone (ex: "youtube", "github")

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => Page, (page) => page.links, { onDelete: 'CASCADE' })
  page: Page;
}
