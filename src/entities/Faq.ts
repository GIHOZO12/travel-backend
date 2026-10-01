import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('faqs')
export class Faq {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'faqs_pkey' })
  id: number;

  @Column('text')
  question: string;

  @Column('text')
  answer: string;

  @Column('int', { default: 0 })
  order: number; // admin-controlled display sequence (SRS §45)

  @Column('boolean', { default: true })
  isPublished: boolean;
}
