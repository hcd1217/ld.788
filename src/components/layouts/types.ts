export interface NavigationItem {
  id: string; // Made required and must be string for consistency
  label: string;
  icon: React.ElementType;
  dummy?: boolean;
  activePaths?: string[];
  hidden?: boolean;
  path?: string;
  subs?: NavigationItem[];
}
