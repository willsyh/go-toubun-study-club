import Image from "next/image";
import type { Box, Portrait, Tutor } from "@/lib/tutors";

/** Round avatar: the face from the tutor's portrait, or her initial on her color. */
export function TutorAvatar({
  tutor,
  size = 40,
  ring = false,
  talking = false,
}: {
  tutor: Tutor;
  size?: number;
  ring?: boolean;
  talking?: boolean;
}) {
  const ringStyle = ring ? { boxShadow: `0 0 0 3px var(--canvas), 0 0 0 5px ${tutor.color}` } : undefined;
  if (tutor.portrait) {
    return (
      <span
        role="img"
        aria-label={tutor.name}
        className="relative inline-block shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size, ...ringStyle }}
      >
        <PortraitView portrait={tutor.portrait} crop={tutor.portrait.face} talking={talking} sizePx={size} />
      </span>
    );
  }
  return (
    <span
      aria-label={tutor.name}
      role="img"
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none"
      style={{ width: size, height: size, backgroundColor: tutor.color, fontSize: size * 0.42, ...ringStyle }}
    >
      {tutor.name[0]}
    </span>
  );
}

/**
 * Draws `crop` of the portrait so it fills its (positioned) parent, with the
 * mouth patch flickering while `talking`. Everything is in percentages, so it
 * scales to any parent size.
 */
export function PortraitView({
  portrait,
  crop,
  talking,
  sizePx,
  priority = false,
}: {
  portrait: Portrait;
  crop?: Box;
  talking: boolean;
  /** Rendered width of the crop, for picking the image resolution. */
  sizePx: number;
  priority?: boolean;
}) {
  const c = crop ?? { x: 0, y: 0, w: portrait.width, h: portrait.height };
  const pct = (n: number) => `${n * 100}%`;
  const { mouth } = portrait;
  return (
    <span
      aria-hidden
      className="absolute block"
      style={{
        left: pct(-c.x / c.w),
        top: pct(-c.y / c.h),
        width: pct(portrait.width / c.w),
        height: pct(portrait.height / c.h),
      }}
    >
      <Image
        src={portrait.src}
        alt=""
        fill
        priority={priority}
        sizes={`${Math.ceil((sizePx * portrait.width) / c.w)}px`}
        className="object-cover"
      />
      {mouth && (
        // eslint-disable-next-line @next/next/no-img-element -- tiny overlay patch; must keep exact pixel alignment
        <img
          src={mouth.src}
          alt=""
          className={`absolute ${talking ? "mouth-talk" : "opacity-0"}`}
          style={{
            left: pct(mouth.box.x / portrait.width),
            top: pct(mouth.box.y / portrait.height),
            width: pct(mouth.box.w / portrait.width),
            height: pct(mouth.box.h / portrait.height),
          }}
        />
      )}
    </span>
  );
}
