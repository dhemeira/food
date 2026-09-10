type ButtonVariant = "primary" | "secondary" | "danger" | "danger-full";
type ButtonSize = "small" | "large";

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  small?: boolean;
  block?: boolean;
}

const baseClass =
  "select-none touch-manipulation " +
  "border-2 text-center text-base font-semibold leading-normal " +
  "transition-all pointer-fine:duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] " +
  "active:translate-y-0.5 " +
  "pointer-fine:hover:-translate-y-0.5 pointer-fine:active:translate-y-0 " +
  "disabled:pointer-events-none";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "border-ui-accent bg-ui-accent text-ui-surface " +
    "active:shadow-[0_0_25px_-5px_var(--color-ui-accent)] " +
    "pointer-fine:hover:bg-ui-accent-hover pointer-fine:hover:shadow-[0_0_25px_-5px_var(--color-ui-accent)]",
  secondary:
    "border-ui-accent bg-transparent text-ui-accent " +
    "active:shadow-[0_0_25px_-10px_var(--color-ui-accent)] " +
    "pointer-fine:hover:bg-ui-accent pointer-fine:hover:text-ui-surface pointer-fine:hover:shadow-[0_0_25px_-10px_var(--color-ui-accent)]",
  danger:
    "border-ui-danger bg-transparent text-ui-danger " +
    "active:shadow-[0_0_25px_-5px_var(--color-ui-danger)] " +
    "pointer-fine:hover:bg-ui-danger pointer-fine:hover:text-text pointer-fine:hover:shadow-[0_0_25px_-10px_var(--color-ui-danger)]",
  "danger-full":
    "border-ui-danger bg-ui-danger text-text " +
    "active:shadow-[0_0_25px_-5px_var(--color-ui-danger)] " +
    "pointer-fine:hover:bg-ui-danger-hover pointer-fine:hover:shadow-[0_0_25px_-5px_var(--color-ui-danger)]",
};

const sizeClass: Record<ButtonSize, string> = {
  small: "px-6 py-2 rounded-lg",
  large: "px-8 py-4 rounded-xl",
};

export function buttonClass({
  variant = "primary",
  small = false,
  block = false,
  className,
}: ButtonStyleProps & { className?: string }): string {
  return [
    baseClass,
    variantClass[variant],
    block ? "block" : "inline-block",
    sizeClass[small ? "small" : "large"],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
