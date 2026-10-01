import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AdminRole } from './enums';
import { timestamp } from './columns';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'admin_users_pkey' })
  id: number;

  @Column('text')
  name: string;

  @Index('admin_users_email_key', { unique: true })
  @Column('text')
  email: string;

  @Column('text')
  password: string; // stored as a bcrypt hash, never plain text

  // The database enum holds lowercase "admin"/"staff" (what every row already
  // contained from the old plain-text column). The transformer converts on the
  // way in and out, so the rest of the app only ever sees AdminRole.ADMIN/STAFF.
  @Column({
    type: 'enum',
    enum: ['admin', 'staff'],
    enumName: 'AdminRole',
    default: 'admin',
    transformer: {
      to: (value: unknown) => (typeof value === 'string' ? value.toLowerCase() : value),
      from: (value: string | null) => value?.toUpperCase(),
    },
  })
  role: AdminRole;

  @CreateDateColumn(timestamp)
  createdAt: Date;

  @UpdateDateColumn(timestamp)
  updatedAt: Date;

  // Set-your-own-password invite flow (see src/utils/inviteToken.ts). When an
  // admin creates a new account, `password` above is filled with a random,
  // never-revealed placeholder — the real password only exists once the new
  // person follows their emailed link and submits one themselves. The token
  // is stored HASHED (like a password) so a leaked database can't be replayed
  // as a working invite link; it's cleared once used. Non-null = "this
  // account hasn't finished setup yet" (shown as "Pending" in the Staff list).
  @Index('admin_users_setPasswordTokenHash_key', { unique: true })
  @Column('text', { nullable: true })
  setPasswordTokenHash: string | null;

  @Column({ ...timestamp, nullable: true })
  setPasswordExpires: Date | null;
}
