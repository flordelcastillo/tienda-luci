import Link from "next/link";
import { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

// ─────────────── Button ───────────────
// Variantes centralizadas con cva — un solo lugar define el diseño de cada botón.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-sage text-cream hover:bg-[#2f3c33]",
        outline: "border border-sage text-sage hover:bg-sage hover:text-cream",
        gold: "bg-gold text-white hover:bg-gold-dark",
        ghost: "text-sage hover:bg-sand/60",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "px-3.5 py-1.5 text-sm",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & ButtonVariants) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export function LinkButton({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonVariants) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };

// ─────────────── Card ───────────────
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-line rounded-[var(--radius-card)] border bg-white shadow-[0_2px_20px_-8px_rgba(59,74,63,0.12)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─────────────── Badge ───────────────
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        sage: "bg-sage/10 text-sage",
        gold: "bg-gold/15 text-gold-dark",
        rose: "bg-rose/30 text-[#8a5a54]",
        red: "bg-red-100 text-red-700",
        gray: "bg-sand text-muted",
      },
    },
    defaultVariants: { tone: "sage" },
  },
);

export function Badge({
  tone,
  className,
  children,
}: {
  tone?: VariantProps<typeof badgeVariants>["tone"];
  className?: string;
  children: ReactNode;
}) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}

// ─────────────── Form fields ───────────────
export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-ink text-sm font-medium">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="text-muted block text-xs">{hint}</span>
      )}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/15";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputBase, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(inputBase, "appearance-none", className)} {...props} />;
}
