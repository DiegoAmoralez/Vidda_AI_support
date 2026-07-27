import { cn } from "@/lib/utils";

type ViddaMarkProps = {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
};

const MarkIcon = ({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) => {
  const navy = inverse ? "#ffffff" : "#2c4269";
  const cyan = inverse ? "#4db3e0" : "#0087c1";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer shield frame */}
      <path
        d="M8 7.5h32v7.8L24 42.5 8 15.3V7.5z"
        stroke={navy}
        strokeWidth="5.2"
        strokeLinejoin="round"
      />
      {/* Nested chevrons / checks */}
      <path
        d="M16.5 14.5L24 28.5 31.5 14.5"
        stroke={navy}
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.2 14.5L24 23.8 28.8 14.5"
        stroke={cyan}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ViddaMark = ({
  compact = false,
  inverse = false,
  className,
}: ViddaMarkProps) => {
  if (compact) {
    return (
      <div
        className={cn("relative grid size-9 shrink-0 place-items-center", className)}
        aria-label="Vidda Solutions"
      >
        <MarkIcon inverse={inverse} className="size-8" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex max-w-full shrink-0 items-center gap-2.5 overflow-visible",
        className,
      )}
      aria-label="Vidda Solutions"
    >
      <MarkIcon inverse={inverse} className="size-8 shrink-0 sm:size-9" />
      <span className="flex min-w-0 items-baseline gap-[0.3em] font-heading text-[1.02rem] font-extrabold uppercase leading-none tracking-[-0.02em] sm:text-[1.12rem]">
        <span className={inverse ? "text-[#4db3e0]" : "text-[var(--vidda-accent)]"}>
          Vidda
        </span>
        <span className={inverse ? "text-white" : "text-[var(--vidda-primary)]"}>
          Solutions
        </span>
      </span>
    </div>
  );
};
