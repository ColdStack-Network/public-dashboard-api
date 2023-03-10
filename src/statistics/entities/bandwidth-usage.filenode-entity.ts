import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'bandwidth_usage' })
export class BandwidthUsageEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ type: 'bigint', nullable: false })
  size: string;

  @Column({ type: 'varchar', nullable: false })
  type: 'download' | 'upload';

  @Column({ type: 'varchar', nullable: false })
  bucketId: string;

  @Column({ type: 'varchar', nullable: true })
  userPublicKey?: string;

  @Column({ type: 'varchar', nullable: true })
  userId?: string;

  @Column({ type: 'jsonb', nullable: true })
  info?: any;
}
