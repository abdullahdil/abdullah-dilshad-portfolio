import { cn } from "@/lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block font-label text-xs uppercase tracking-widest text-on-surface-variant",
        className,
      )}
      {...props}
    />
  );
}

const controlBase =
  "w-full rounded-md border border-outline-variant/20 bg-background px-4 py-4 text-on-surface placeholder:text-outline transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(controlBase, className)} {...props} />;
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea className={cn(controlBase, "min-h-28 resize-y", className)} {...props} />
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn(controlBase, className)} {...props}>
      {children}
    </select>
  );
}

type FieldErrorProps = {
  id?: string;
  children?: React.ReactNode;
};

export function FieldError({ id, children }: FieldErrorProps) {
  if (!children) return null;
  return (
    <p id={id} className="text-sm text-error" role="alert">
      {children}
    </p>
  );
}
