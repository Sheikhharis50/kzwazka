type SidebarLink = {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
  access?: {
    role?: 'admin' | 'children' | 'coach';
    permissions?: string | string[];
  };
};

type Option = {
  value: string | number;
  label: string;
};

type SvgProp = {
  className?: string;
};

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortBy {
  CREATED_AT = 'created_at',
  DOB = 'dob',
  NAME = 'name',
}

export type { SidebarLink, Option, SvgProp };
