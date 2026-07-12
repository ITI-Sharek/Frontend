export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  /** Show an online/offline status dot when set. */
  online?: boolean;
  style?: React.CSSProperties;
}

export declare function Avatar(props: AvatarProps): JSX.Element;
