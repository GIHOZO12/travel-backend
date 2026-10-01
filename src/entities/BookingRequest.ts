import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Tour } from './Tour';
import { BookingStatus } from './enums';
import { timestamp } from './columns';

@Entity('booking_requests')
export class BookingRequest {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'booking_requests_pkey' })
  id: number;

  @Column('text')
  fullName: string;

  @Column('text')
  email: string;

  @Column('text')
  phone: string;

  @Column('text', { nullable: true })
  nationality: string | null;

  @Column(timestamp)
  travelDate: Date;

  @Column('int')
  numberOfTravelers: number;

  @Column('text', { nullable: true })
  accommodationPref: string | null;

  @Column('text', { nullable: true })
  specialRequests: string | null;

  @Column({ type: 'enum', enum: BookingStatus, enumName: 'BookingStatus', default: BookingStatus.NEW })
  status: BookingStatus;

  @CreateDateColumn(timestamp)
  createdAt: Date;

  @UpdateDateColumn(timestamp)
  updatedAt: Date;

  // RESTRICT: a tour with booking requests can't be deleted.
  @ManyToOne(() => Tour, (tour) => tour.bookingRequests, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'tourId', foreignKeyConstraintName: 'booking_requests_tourId_fkey' })
  tour: Tour;

  @Column('int')
  tourId: number;
}
