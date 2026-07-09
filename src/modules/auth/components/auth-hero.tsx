interface AuthHeroProps {
  heading: string;
  subtext: string;
}

export function AuthHero({ heading, subtext }: AuthHeroProps) {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <img
        src="/logo-1.png"
        alt="Sharek"
        width={100}
        height={100}
        className="size-20 object-cover"
      />
      <div className="flex w-full flex-col items-center gap-2">
        <h1 className="text-center text-5xl leading-[56px] font-bold tracking-[-1.2px] text-foreground">
          {heading}
        </h1>
        <p className="text-center text-base leading-6 text-muted-foreground">
          {subtext}
        </p>
      </div>
    </div>
  );
}
