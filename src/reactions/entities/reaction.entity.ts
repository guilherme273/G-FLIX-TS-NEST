import { MovieEntity } from 'src/movie/entities/movie.entity';
import { ReactionTypeEntity } from 'src/reactions_types/entities/reactions_type.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('reactions')
export class ReactionsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_user: number;

  @Column()
  id_reactions_type: number;

  @Column()
  id_movie: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(
    () => ReactionTypeEntity,
    (reactionType) => reactionType.reactions,
    {
      eager: true,
    },
  )
  @JoinColumn({ name: 'id_reactions_type' })
  reactionType: ReactionTypeEntity;

  @ManyToOne(() => MovieEntity, (movie) => movie.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_movie' })
  movie: MovieEntity;

  @ManyToOne(() => UserEntity, (user) => user.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_user' })
  user: UserEntity;
}
