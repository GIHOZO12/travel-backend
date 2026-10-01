import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tour } from './Tour';
import { InquiryStatus } from './enums';
import { timestamp } from './columns';

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'inquiries_pkey' })
  id: number;

  @Column('text')
  fullName: string;

  @Column('text')
  email: string;

  @Column('text', { nullable: true })
  phone: string | null;

  @Column('text', { nullable: true })
  destinationName: string | null; // free-text fallback if no specific tour selected

  @Column({ ...timestamp, nullable: true })
  preferredDate: Date | null;

  @Column('int', { nullable: true })
  numberOfTravelers: number | null;

  @Column('text', { nullable: true })
  message: string | null;

  @Column({ type: 'enum', enum: InquiryStatus, enumName: 'InquiryStatus', default: InquiryStatus.NEW })
  status: InquiryStatus;

  @CreateDateColumn(timestamp)
  createdAt: Date;

  // Optional relation — SET NULL: deleting a tour keeps the inquiry, just
  // without a tour attached.
  @ManyToOne(() => Tour, (tour) => tour.inquiries, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'tourId', foreignKeyConstraintName: 'inquiries_tourId_fkey' })
  tour: Tour | null;

  @Column('int', { nullable: true })
  tourId: number | null;
}
