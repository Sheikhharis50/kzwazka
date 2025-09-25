import { PaginationParams } from 'api/type';
import { SortBy, SortOrder } from 'types';

export type GetChildrenQueryParams = {
  search?: string;
  group_id?: string;
  sort_order?: SortOrder;
  sort_by?: SortBy.CREATED_AT | SortBy.DOB;
} & PaginationParams;
