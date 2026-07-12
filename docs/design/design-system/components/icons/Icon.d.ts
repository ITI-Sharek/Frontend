export interface IconProps {
  /** Lucide icon name, kebab-case (e.g. "mail", "lock", "eye", "arrow-left", "github", "globe"). */
  name: string;
  size?: number;
  style?: React.CSSProperties;
}

export declare function Icon(props: IconProps): JSX.Element;
