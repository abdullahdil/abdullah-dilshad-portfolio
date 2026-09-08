import Image from "next/image";

/** Used when the profile row has no portrait uploaded yet. */
const FALLBACK_PORTRAIT = "/images/hero-portrait-v2.jpg";

type HeroPortraitProps = {
  alt: string;
  src?: string | null;
};

export function HeroPortrait({ alt, src }: HeroPortraitProps) {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-outline-variant bg-black">
        <Image
          src={src || FALLBACK_PORTRAIT}
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
