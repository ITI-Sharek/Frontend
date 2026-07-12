export interface NotificationBadgeProps {
  /** Lucide icon name for the bell/glyph, default "bell". */
  icon?: string;
  count?: number;
  style?: React.CSSProperties;
}

export declare function NotificationBadge(props: NotificationBadgeProps): JSX.Element;
