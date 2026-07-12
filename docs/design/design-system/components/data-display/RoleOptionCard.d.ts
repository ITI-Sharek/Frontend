export interface RoleOptionCardProps {
  title: string;
  description: string;
  /** Lucide icon name, e.g. "users", "briefcase". */
  icon?: string;
  selected: boolean;
  onSelect: () => void;
}

export declare function RoleOptionCard(props: RoleOptionCardProps): JSX.Element;
