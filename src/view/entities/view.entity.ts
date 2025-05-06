import { MovieEntity } from 'src/movie/entities/movie.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('view')
export class ViewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_user: number;

  @Column()
  id_movie: number;

  @Column()
  seconds_watched: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => MovieEntity, (movie) => movie.views, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_movie' })
  movie: MovieEntity;

  @ManyToOne(() => UserEntity, (user) => user.views, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_user' })
  user: UserEntity;
}
