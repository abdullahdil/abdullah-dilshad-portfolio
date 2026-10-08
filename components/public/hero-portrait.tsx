import Image from "next/image";

/** Used when the profile row has no portrait uploaded yet. */
const FALLBACK_PORTRAIT = "/images/hero-portrait-v2.jpg";

type HeroPortraitProps = {
  alt: string;
  src?: string | null;
  /** Optional caption line(s) under the frame. */
  caption?: React.ReactNode;
};

/**
 * The owner's real portrait as the hero's visual. The photo is shot on pure
 * black, so the frame is ink in both themes — its edges dissolve into the
 * frame instead of reading as a pasted rectangle on the light paper. Fixed
 * 4:5 box, so nothing shifts while it loads.
 */
export function HeroPortrait({ alt, src, caption }: HeroPortraitProps) {
  return (
    <figure className="mx-auto w-full max-w-[20rem] sm:max-w-[22rem] lg:mx-0 lg:ml-auto lg:max-w-[24rem]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-outline-variant bg-[#050505] shadow-lg">
        <Image
          src={src || FALLBACK_PORTRAIT}
          alt={alt}
          fill
          preload
          quality={92}
          className="object-cover object-[50%_20%]"
          sizes="(max-width: 640px) 20rem, (max-width: 1024px) 22rem, 24rem"
        />
      </div>
      {caption ? (
        <figcaption className="mt-4 text-center lg:text-left">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
