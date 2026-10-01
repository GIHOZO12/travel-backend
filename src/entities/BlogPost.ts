import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { textArray, timestamp } from './columns';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'blog_posts_pkey' })
  id: number;

  @Column('text')
  title: string;

  @Index('blog_posts_slug_key', { unique: true })
  @Column('text')
  slug: string;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  featuredImage: string | null;

  @Column('text', { nullable: true })
  author: string | null;

  @Column('text', { nullable: true })
  category: string | null;

  @Column(textArray)
  tags: string[];

  @Column('boolean', { default: true })
  isPublished: boolean;

  @Column({ ...timestamp, nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn(timestamp)
  createdAt: Date;

  @UpdateDateColumn(timestamp)
  updatedAt: Date;
}
