import { CategoryEntity } from 'src/category/entities/category.entity';
import { ReactionsEntity } from 'src/reactions/entities/reaction.entity';
import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'movie' })
export class MovieEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column()
  cover: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CategoryEntity, (category) => category.movies, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @OneToMany(() => ReactionsEntity, (reaction) => reaction.movie)
  reactions: ReactionsEntity[];
  reactionCounts: any;
}
