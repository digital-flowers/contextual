import clsx from "clsx";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted";

interface BadgeProps {
  variant?: BadgeVariant;
  pulse?: boolean;
  children: React.ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-accent/20 text-accent",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  danger: "bg-danger/20 text-danger",
  muted: "bg-border/40 text-muted",
};

export function Badge({ variant = "default", pulse, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        pulse && "animate-pulse"
      )}
    >
      {children}
    </span>
  );
}
