interface AuthHeroProps {
  heading: string;
  subtext: string;
}

export function AuthHero({ heading, subtext }: AuthHeroProps) {
  return (
    <div className="flex w-full flex-col gap-1 text-right">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
        {heading}
      </h1>
      <p className="text-xs sm:text-sm leading-snug text-muted-foreground">
        {subtext}
      </p>
    </div>
  );
}
