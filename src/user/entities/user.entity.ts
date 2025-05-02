import { FavoritesEntity } from 'src/favorites/entities/favorite.entity';
import { ReactionsEntity } from 'src/reactions/entities/reaction.entity';
import { ViewEntity } from 'src/view/entities/view.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'email', nullable: false })
  email: string;

  @Column({ name: 'password', nullable: false })
  password: string;

  @Column({ name: 'type', type: 'int', nullable: false, default: 0 })
  type: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => ReactionsEntity, (reaction) => reaction.user)
  reactions: ReactionsEntity[];

  @OneToMany(() => FavoritesEntity, (favorite) => favorite.user)
  favorites: FavoritesEntity[];

  @OneToMany(() => ViewEntity, (view) => view.user)
  views: ViewEntity[];
}
