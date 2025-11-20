import { PartialType } from '@nestjs/mapped-types';
import { CreateCotractingDto } from './create-cotracting.dto';

export class UpdateCotractingDto extends PartialType(CreateCotractingDto) {}
