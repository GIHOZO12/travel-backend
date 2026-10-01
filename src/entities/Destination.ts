import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Tour } from './Tour';
import { textArray, timestamp } from './columns';

@Entity('destinations')
export class Destination {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'destinations_pkey' })
  id: number;

  @Column('text')
  name: string;

  @Index('destinations_slug_key', { unique: true })
  @Column('text')
  slug: string;

  @Column('text')
  country: string;

  @Column('text')
  overview: string;

  @Column(textArray)
  attractions: string[];

  @Column(textArray)
  activities: string[];

  @Column('text', { nullable: true })
  bestTimeToVisit: string | null;

  @Column('text', { nullable: true })
  heroImage: string | null;

  @Column(textArray)
  images: string[];

  @Column('boolean', { default: false })
  isFeatured: boolean;

  @Column('boolean', { default: true })
  isPublished: boolean;

  @CreateDateColumn(timestamp)
  createdAt: Date;

  @UpdateDateColumn(timestamp)
  updatedAt: Date;

  @OneToMany(() => Tour, (tour) => tour.destination)
  tours: Tour[];
}
