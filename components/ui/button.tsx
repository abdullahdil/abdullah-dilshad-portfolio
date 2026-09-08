import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-fixed-dim border border-transparent",
  secondary:
    "bg-surface-high text-on-surface hover:bg-surface-bright border border-outline-variant",
  outline:
    "border border-outline-variant text-on-surface hover:bg-surface-high bg-transparent",
  ghost:
    "border border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-high",
  danger:
    "bg-error-container text-on-error-container hover:brightness-110 border border-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-body-md",
  lg: "px-6 py-3 text-body-md",
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
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
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
