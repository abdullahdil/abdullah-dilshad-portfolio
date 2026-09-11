import Image from "next/image";

/** Used when the profile row has no portrait uploaded yet. */
const FALLBACK_PORTRAIT = "/images/hero-portrait-v2.jpg";

type HeroPortraitProps = {
  alt: string;
  src?: string | null;
};

export function HeroPortrait({ alt, src }: HeroPortraitProps) {
  return (
    <figure className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:mx-0 lg:max-w-none">
      {/* Hairline frame, offset one pixel — no glow, no tilt. */}
      <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-high">
        <div className="relative aspect-[4/5]">
          <Image
            src={src || FALLBACK_PORTRAIT}
            alt={alt}
            fill
            priority
            quality={90}
            className="object-cover object-center"
            sizes="(max-width: 640px) 20rem, (max-width: 1024px) 24rem, 27rem"
          />
        </div>
      </div>
    </figure>
  );
}
