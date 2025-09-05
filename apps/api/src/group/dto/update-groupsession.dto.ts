import { CreateGroupSessionDto } from './create-groupsession.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateGroupSessionDto extends OmitType(CreateGroupSessionDto, [
  'group_id',
]) {}
