import Image from "next/image";

const HERO_PORTRAIT = "/images/hero-portrait-v2.jpg";

type HeroPortraitProps = {
  alt: string;
};

export function HeroPortrait({ alt }: HeroPortraitProps) {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-outline-variant bg-black">
        <Image
          src={HERO_PORTRAIT}
          alt={alt}
          fill
          priority
          quality={92}
          className="object-cover object-center"
          sizes="(max-width: 1024px) 28rem, 26rem"
        />
      </div>
    </div>
  );
}
