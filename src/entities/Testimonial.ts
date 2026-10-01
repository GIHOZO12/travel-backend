import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { timestamp } from './columns';

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'testimonials_pkey' })
  id: number;

  @Column('text')
  customerName: string;

  @Column('text', { nullable: true })
  country: string | null;

  @Column('text', { nullable: true })
  category: string | null; // e.g. "Family", "Honeymoon", "Corporate"

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  photo: string | null;

  @Column('boolean', { default: false })
  isApproved: boolean;

  @CreateDateColumn(timestamp)
  createdAt: Date;
}
