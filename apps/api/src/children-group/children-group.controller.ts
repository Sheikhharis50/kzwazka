import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ChildrenGroupService } from './children-group.service';
import { CreateChildrenGroupDto } from './dto/create-children-group.dto';
import { UpdateChildrenGroupDto } from './dto/update-children-group.dto';
import { QueryChildrenGroupDto } from './dto/query-children-group.dto';
import {
  ChildrenGroupResponseDto,
  ChildrenGroupWithChildrenAndGroupDto,
  PaginatedChildrenGroupResponseDto,
} from './dto/children-group-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  PermissionGuard,
  RequirePermission,
} from 'src/auth/guards/permission.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Children Group Management')
@Controller('api/children-group')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ChildrenGroupController {
  constructor(private readonly childrenGroupService: ChildrenGroupService) {}

  @ApiOperation({ summary: 'Assign multiple children to a group' })
  @ApiResponse({
    status: 201,
    description: 'The children have been successfully assigned to the group.',
    type: [ChildrenGroupResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 409,
    description: 'Some children are already assigned to this group',
  })
  @ApiBearerAuth()
  @RequirePermission(['create_children_group'])
  @Post()
  create(@Body() createChildrenGroupDto: CreateChildrenGroupDto) {
    return this.childrenGroupService.create(createChildrenGroupDto);
  }

  @ApiOperation({
    summary:
      'Get all children-group relationships with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description:
      'The children-group relationships have been successfully fetched.',
    type: PaginatedChildrenGroupResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  @RequirePermission(['read_children_group'])
  @Get()
  @ApiQuery({ name: 'children_id', required: false, type: Number })
  @ApiQuery({ name: 'group_id', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  findAll(@Query() queryDto: QueryChildrenGroupDto) {
    return this.childrenGroupService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get a specific children-group relationship by ID' })
  @ApiResponse({
    status: 200,
    description:
      'The children-group relationship has been successfully fetched.',
    type: ChildrenGroupWithChildrenAndGroupDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 404,
    description: 'Children-group relationship not found',
  })
  @ApiBearerAuth()
  @RequirePermission(['read_children_group'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.childrenGroupService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a children-group relationship by ID' })
  @ApiResponse({
    status: 200,
    description:
      'The children-group relationship has been successfully updated.',
    type: ChildrenGroupResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 404,
    description: 'Children-group relationship not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Child is already assigned to this group',
  })
  @ApiBearerAuth()
  @RequirePermission(['update_children_group'])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChildrenGroupDto: UpdateChildrenGroupDto
  ) {
    return this.childrenGroupService.update(+id, updateChildrenGroupDto);
  }

  @ApiOperation({ summary: 'Remove a child from a group' })
  @ApiResponse({
    status: 200,
    description: 'The child has been successfully removed from the group.',
    type: ChildrenGroupResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 404,
    description: 'Children-group relationship not found',
  })
  @ApiBearerAuth()
  @RequirePermission(['delete_children_group'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.childrenGroupService.remove(+id);
  }
}
