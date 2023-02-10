import { Column, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';
import { ObjectVersionEntity } from './object-version.filenode-entity';

@Entity({ name: 'objects' })
@Index(['key', 'bucket'], { unique: true })
export class ObjectEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  /**
   * Note the collation C.UTF-8
   */
  @Column({ type: 'varchar', collation: 'C.UTF-8' })
  key: string;

  /**
   * User id
   */
  @Column({ type: 'varchar' })
  bucket: string;

  @Column({ type: 'varchar', nullable: false })
  acl: 'public-read' | 'private';

  @Column({ type: 'enum', enum: ['file', 'folder'], nullable: false })
  type: 'file' | 'folder';

  @Column({ type: 'varchar', nullable: false })
  filename: string;

  @OneToMany(() => ObjectVersionEntity, (version) => version.object)
  versions?: ObjectVersionEntity[];
}
