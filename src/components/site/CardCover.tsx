import { ReactNode } from "react";

type Props = {
  src?: string | null;
  alt?: string;
  fallback?: ReactNode;
  aspect?: string;
  /** Tailwind class for the card body background that gradient fades into. */
  toClass?: string;
};

/**
 * Image cover with a smooth gradient transition into the card body.
 * Eliminates the harsh boundary between image and text area.
 */
export function CardCover({ src, alt, fallback, aspect = "aspect-[16/10]", toClass = "to-card" }: Props) {
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
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent ${toClass}`} />
    </div>
  );
}
