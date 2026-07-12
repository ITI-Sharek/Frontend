export interface AuthHeroProps {
  heading: string;
  subtext: string;
  /** Path to the logo image, relative to wherever this is mounted. */
  logoSrc?: string;
}

export declare function AuthHero(props: AuthHeroProps): JSX.Element;
