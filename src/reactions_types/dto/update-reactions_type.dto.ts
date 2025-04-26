import { PartialType } from '@nestjs/mapped-types';
import { CreateReactionsTypeDto } from './create-reactions_type.dto';

export class UpdateReactionsTypeDto extends PartialType(
  CreateReactionsTypeDto,
) {}
