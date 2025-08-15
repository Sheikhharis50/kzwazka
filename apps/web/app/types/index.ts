type SidebarLink = {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
};

type Option = {
  value: string | number;
  label: string;
};

type SvgProp = {
  className?: string;
};

export type { SidebarLink, Option, SvgProp };
