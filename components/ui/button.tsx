import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "accent";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-primary text-on-primary shadow-xs hover:bg-primary-fixed-dim",
  accent:
    "border border-transparent bg-accent text-on-accent shadow-xs hover:bg-accent-hover",
  secondary:
    "border border-outline-variant bg-surface-container text-on-surface shadow-xs hover:border-outline-strong hover:bg-surface-high",
  outline:
    "border border-outline-strong bg-transparent text-on-surface hover:bg-surface-high",
  ghost:
    "border border-transparent text-on-surface-variant hover:bg-surface-high hover:text-on-surface",
  danger:
    "border border-transparent bg-error-container text-on-error-container hover:brightness-110",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-body-sm",
  md: "h-10 px-4.5 text-body-md",
  lg: "h-11 px-6 text-body-md",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
  download?: boolean | string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if ("href" in props && props.href) {
    const { href, target, rel, download, onClick } = props;
    return (
      <Link
        href={href}
        className={classes}
        target={target}
        rel={rel}
        download={download}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button type={buttonProps.type ?? "button"} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
