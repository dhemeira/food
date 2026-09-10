import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";

type GlassSurfaceProps<T extends ElementType = "div"> = {
  as?: T;
  children?: ReactNode;
} & ComponentPropsWithoutRef<T>;

/**
 * GlassSurface applies a translucent "glass" material, polymorphic via `as`.
 *
 * ```tsx
 * <GlassSurface className="rounded-full">…</GlassSurface>
 * <GlassSurface as="button" onClick={…}>Button</GlassSurface>
 * ```
 */
export function GlassSurface<T extends ElementType = "div">({
  as,
  className,
  children,
  ...rest
}: GlassSurfaceProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return (
    <Component
      className={`bg-text/10 backdrop-blur-xs inset-shadow-[0_0_2px_1px_#eef0fb22] backdrop-saturate-150  ${className ?? ""}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default GlassSurface;
