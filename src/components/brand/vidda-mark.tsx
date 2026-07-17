import { cn } from "@/lib/utils";

type ViddaMarkProps = {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
};

export const ViddaMark = ({
  compact = false,
  inverse = false,
  className,
}: ViddaMarkProps) => (
  <div className={cn("flex items-center gap-2.5", className)} aria-label="Vidda">
    <span
      className={cn(
        "relative grid size-9 place-items-center overflow-hidden rounded-[11px]",
        inverse ? "bg-[var(--vidda-accent)]" : "bg-[var(--vidda-primary)]",
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          "absolute size-4 rotate-45 rounded-[4px]",
          inverse ? "bg-[var(--vidda-primary)]" : "bg-[var(--vidda-accent)]",
        )}
      />
      <span
        className={cn(
          "absolute bottom-1.5 right-1.5 size-2 rounded-full",
          inverse ? "bg-white" : "bg-white/90",
        )}
      />
    </span>
    {!compact && (
      <span className="leading-none">
        <span
          className={cn(
            "block text-[1.05rem] font-extrabold tracking-[-0.04em]",
            inverse ? "text-white" : "text-[var(--vidda-primary)]",
          )}
        >
          VIDDA
        </span>
        <span
          className={cn(
            "mt-1 block text-[8px] font-bold uppercase tracking-[0.18em]",
            inverse ? "text-white/55" : "text-muted-foreground",
          )}
        >
          Compliance AI
        </span>
      </span>
    )}
  </div>
);
