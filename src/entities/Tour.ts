import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Destination } from './Destination';
import { ItineraryDay } from './ItineraryDay';
import { Inquiry } from './Inquiry';
import { BookingRequest } from './BookingRequest';
import { textArray, timestamp } from './columns';

@Entity('tours')
export class Tour {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'tours_pkey' })
  id: number;

  @Column('text')
  name: string;

  @Index('tours_slug_key', { unique: true })
  @Column('text')
  slug: string;

  @Column('text')
  category: string; // e.g. "Wildlife Safari", "Gorilla Trekking", "Cultural Tour"

  @Column('int')
  durationDays: number;

  @Column('int')
  durationNights: number;

  // The pg driver returns DECIMAL columns as strings (e.g. "1250.00") so no
  // precision is lost converting to a JS number.
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  startingPrice: string | null;

  @Column('text', { default: 'USD' })
  currency: string;

  @Column('text')
  overview: string;

  @Column(textArray)
  highlights: string[];

  @Column(textArray)
  inclusions: string[];

  @Column(textArray)
  exclusions: string[];

  @Column(textArray)
  requirements: string[];

  @Column('text', { nullable: true })
  featuredImage: string | null;

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

  // RESTRICT: a destination can't be deleted while tours still point at it.
  @ManyToOne(() => Destination, (destination) => destination.tours, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'destinationId', foreignKeyConstraintName: 'tours_destinationId_fkey' })
  destination: Destination;

  @Column('int')
  destinationId: number;

  // cascade: saving a new Tour with `itineraryDays` filled in inserts those
  // days too, in the same transaction.
  @OneToMany(() => ItineraryDay, (day) => day.tour, { cascade: ['insert'] })
  itineraryDays: ItineraryDay[];

  @OneToMany(() => Inquiry, (inquiry) => inquiry.tour)
  inquiries: Inquiry[];

  @OneToMany(() => BookingRequest, (booking) => booking.tour)
  bookingRequests: BookingRequest[];
}
