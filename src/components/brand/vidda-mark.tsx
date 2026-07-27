import Image from "next/image";
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
}: ViddaMarkProps) => {
  const src = compact
    ? inverse
      ? "/vidda-mark-light.png"
      : "/vidda-mark.png"
    : inverse
      ? "/vidda-logo-light.png"
      : "/vidda-logo.png";

  if (compact) {
    return (
      <div
        className={cn("relative size-9 shrink-0 overflow-visible", className)}
        aria-label="Vidda Solutions"
      >
        <Image
          src={src}
          alt="Vidda Solutions"
          width={80}
          height={80}
          className="size-full object-contain object-center"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex w-full max-w-[200px] shrink-0 items-center overflow-visible sm:max-w-[220px]",
        className,
      )}
      aria-label="Vidda Solutions"
    >
      {/* Keep full lockup (mark + VIDDA + SOLUTIONS) via width-first scaling */}
      <Image
        src={src}
        alt="Vidda Solutions"
        width={509}
        height={104}
        className="h-auto w-full max-h-10 object-contain object-left"
        sizes="(max-width: 640px) 200px, 220px"
        priority
      />
    </div>
  );
};
