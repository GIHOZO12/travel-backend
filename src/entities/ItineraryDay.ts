import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tour } from './Tour';
import { textArray } from './columns';

// A tour can't have two "Day 3"s.
@Index('itinerary_days_tourId_dayNumber_key', ['tourId', 'dayNumber'], { unique: true })
@Entity('itinerary_days')
export class ItineraryDay {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'itinerary_days_pkey' })
  id: number;

  @Column('int')
  dayNumber: number;

  @Column('text')
  title: string;

  @Column(textArray)
  activities: string[];

  // CASCADE: deleting a tour deletes its itinerary days with it.
  @ManyToOne(() => Tour, (tour) => tour.itineraryDays, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'tourId', foreignKeyConstraintName: 'itinerary_days_tourId_fkey' })
  tour: Tour;

  @Column('int')
  tourId: number;
}
