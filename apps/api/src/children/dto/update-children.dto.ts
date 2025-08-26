import { PartialType } from '@nestjs/mapped-types';
import { CreateChildrenDto } from './create-children.dto';

export class UpdateChildrenDto extends PartialType(CreateChildrenDto) {}
