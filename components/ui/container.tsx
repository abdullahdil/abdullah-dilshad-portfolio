import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "main" | "nav";
  /** Measure width. `default` is the 1120px page measure. */
  size?: "narrow" | "default" | "wide" | "full";
};

const sizeClasses = {
  narrow: "max-w-container-narrow",
  default: "max-w-container-max",
  wide: "max-w-container-wide",
  full: "max-w-none",
} as const;

export function Container({
  children,
  className,
  as: Tag = "div",
  size = "default",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-margin-mobile md:px-margin-desktop",
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
