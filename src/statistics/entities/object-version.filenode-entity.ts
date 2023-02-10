import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ObjectEntity } from './object.filenode-entity';

@Entity({ name: 'object_versions' })
export class ObjectVersionEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @ManyToOne(() => ObjectEntity, (object) => object.versions)
  object: ObjectEntity;

  @Column({ type: 'varchar', nullable: false })
  objectId: string;

  @Column({ type: 'varchar', nullable: false })
  bucketId: string;

  @Column({ type: 'timestamptz', nullable: false })
  modifiedAt: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  isDeleteMarker: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  behaveAsVersionWithNullId: boolean;

  /**
   * Size of the file in bytes.
   * NOT NULL if isDeleteMarker = false
   * NULL if isDeleteMarker = true
   */
  @Column({ type: 'bigint', nullable: true })
  size: string;

  @Column({ type: 'jsonb', nullable: true })
  headers?: {
    'Cache-Control'?: string;
    'Content-Disposition'?: string;
    'Content-Encoding'?: string;
    'Content-Language'?: string;
    'Content-Type'?: string;
    Expires?: string;
  };

  @Column({ type: 'varchar', nullable: true })
  contentMd5?: string;

  /**
   * NOT NULL if isDeleteMarker = false
   */
  @Column({ type: 'varchar', nullable: true })
  etag: string;

  /**
   * Sha256 hash in hex format without leading `0x`
   * NOT NULL if isDeleteMarker = false
   */
  @Column({ type: 'varchar', nullable: true })
  fileContentsSha256: string;

  /**
   * Sha256 hash in hex format without leading `0x`
   * NOT NULL if isDeleteMarker = false
   */
  @Column({ type: 'varchar', nullable: true })
  fileNameSha256: string;

  /**
   * Ethereum Wallet address with the leading `0x`
   * NOT NULL if isDeleteMarker = false
   */
  @Column({ type: 'varchar', nullable: true })
  gatewayEthAddress: string;

  /**
   * NOT NULL if isDeleteMarker = false
   */
  @Column({ type: 'boolean', nullable: true })
  storageForceChosen: boolean;

  @Column({ type: 'varchar', nullable: true })
  locationFromGateway?: string;

  /**
   * NOT NULL if isDeleteMarker = false
   */
  @Column({ type: 'varchar', nullable: true })
  gatewayType: string;

  @Column({ type: 'varchar', nullable: true })
  gatewayAddress?: string;

  /**
   * NOT NULL if isDeleteMarker = false
   */
  @Column({ type: 'varchar', nullable: true })
  gatewayHash: string;

  /**
   * NOT NULL if isDeleteMarker = false
   */
  @Column({ type: 'varchar', nullable: true })
  storageClass: string;
}
