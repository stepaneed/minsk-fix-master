import { ReactNode } from "react";

type Props = {
  src?: string | null;
  alt?: string;
  fallback?: ReactNode;
  aspect?: string;
  /** Tailwind class for the card body background that gradient fades into. */
  toClass?: string;
  /** Big overlay rendered on top of the image (e.g. promo benefit). */
  badge?: ReactNode;
  /** Veil opacity on top of the image, 0..1. Uses card background color. */
  overlayOpacity?: number;
};

/**
 * Image cover with a smooth gradient transition into the card body.
 * Optional veil + badge for promo-style emphasis.
 */
export function CardCover({
  src,
  alt,
  fallback,
  aspect = "aspect-[16/10]",
  toClass = "to-card",
  badge,
  overlayOpacity = 0,
}: Props) {
  return (
    <div className={`relative w-full overflow-hidden bg-secondary ${aspect}`}>
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">{fallback}</div>
      )}
      {src && overlayOpacity > 0 && (
        <div
          className="pointer-events-none absolute inset-0 bg-background"
          style={{ opacity: overlayOpacity }}
        />
      )}
      {badge && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-start p-5">
          {badge}
        </div>
      )}
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-b from-transparent ${toClass}`} />
    </div>
  );
}
