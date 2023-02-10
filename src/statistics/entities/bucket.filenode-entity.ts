import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'buckets' })
export class BucketEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  ownerPublicKey?: string;

  @Column({ type: 'uuid', nullable: true })
  ownerUserId?: string;
}
