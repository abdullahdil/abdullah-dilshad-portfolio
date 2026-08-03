import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === "center" && "text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="mb-2 block font-label uppercase text-primary">{eyebrow}</span>
      ) : null}
      <h2 className="font-heading text-headline-lg text-on-surface">{title}</h2>
      {description ? (
        <p
          className={cn(
            "mt-2 max-w-md text-body-md text-on-surface-variant",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
