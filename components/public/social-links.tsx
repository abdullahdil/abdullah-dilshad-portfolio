import { cn } from "@/lib/utils";

/**
 * Brand marks for LinkedIn, Instagram and X.
 *
 * lucide-react 1.28 ships no brand icons at all (they were removed from the
 * icon set), so all three glyphs are inline SVG here. They are drawn as one
 * consistent set: the same 24x24 box, the same solid `currentColor` fill and
 * the same optical weight, so no icon reads as heavier than its neighbours.
 */
type SocialIconProps = { className?: string };

function LinkedInIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm4.5 2.9a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2Zm0 2a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm5.55-2.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"
      />
    </svg>
  );
}

function XIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.25 6.93 6.06-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.4Z" />
    </svg>
  );
}

export type SocialLinksProps = {
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  xUrl?: string | null;
  /** `sm` for the desktop header bar, `md` for touch targets (mobile menu). */
  size?: "sm" | "md";
  className?: string;
  /** Labels the group for assistive tech; defaults to "Social profiles". */
  label?: string;
  onNavigate?: () => void;
};

const sizeClasses = {
  sm: { link: "h-9 w-9", icon: "h-[18px] w-[18px]" },
  md: { link: "h-11 w-11", icon: "h-5 w-5" },
} as const;

/**
 * Renders the socials that actually have a URL — a missing one is simply
 * absent, never an empty slot — and renders nothing at all when none are set.
 */
export function SocialLinks({
  linkedinUrl,
  instagramUrl,
  xUrl,
  size = "sm",
  className,
  label = "Social profiles",
  onNavigate,
}: SocialLinksProps) {
  const items = [
    { key: "linkedin", href: linkedinUrl, name: "LinkedIn", Icon: LinkedInIcon },
    { key: "instagram", href: instagramUrl, name: "Instagram", Icon: InstagramIcon },
    { key: "x", href: xUrl, name: "X", Icon: XIcon },
  ].filter((item): item is typeof item & { href: string } => Boolean(item.href));

  if (items.length === 0) return null;

  const { link, icon } = sizeClasses[size];

  return (
    <ul
      aria-label={label}
      className={cn("flex items-center gap-1", className)}
    >
      {items.map(({ key, href, name, Icon }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className={cn(
              "inline-flex items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-high hover:text-accent",
              link,
            )}
          >
            <Icon className={icon} />
            <span className="sr-only">{name} profile (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
