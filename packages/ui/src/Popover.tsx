import { useEffect, useRef, useState, type ReactNode } from "react";

interface PopoverProps {
  trigger: ReactNode;
  label: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  /** Space between the trigger and the menu, in Tailwind spacing steps (1 = 0.25rem). */
  gap?: number;
  /** Marks the root with `data-active` so a TabBar pill can sit on it. */
  active?: boolean;
  className?: string;
  menuClassName?: string;
}

/**
 * Popover renders a button that toggles an absolutely-positioned menu,
 * closing on outside click and Escape. Pass `children` as a render function
 * to receive a `close` callback so menu items can dismiss the popover while
 * performing their own action (navigate, sign out, …).
 *
 * ```tsx
 * <Popover label="Account" align="end" side="top" trigger={<Avatar … />}>
 *   {(close) => (
 *     <>
 *       <Link to="/profile" onClick={close}>Edit profile</Link>
 *       <button onClick={() => { close(); void signOut(); }}>Log out</button>
 *     </>
 *   )}
 * </Popover>
 * ```
 */
function Popover({
  trigger,
  label,
  children,
  side = "top",
  align = "center",
  gap = 2,
  active = false,
  className,
  menuClassName,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const close = (): void => setOpen(false);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent): void {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const sideClass = side === "top" ? "bottom-full" : "top-full";
  // A dynamic `mt-${gap}` class wouldn't be generated at build time, so the
  // spacing is applied inline in Tailwind's 0.25rem step units.
  const gapStyle =
    side === "top"
      ? { marginBottom: `${String(gap * 0.25)}rem` }
      : { marginTop: `${String(gap * 0.25)}rem` };
  const alignClass =
    align === "start"
      ? "left-0"
      : align === "end"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      ref={rootRef}
      data-active={active ? "true" : undefined}
      className={`relative ${className ?? ""}`}
    >
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-full w-full items-center justify-center"
      >
        {trigger}
      </button>
      {open ? (
        <div
          role="menu"
          style={gapStyle}
          className={`border-ui-border bg-ui-surface-2 text-ui-text absolute z-30 min-w-44 rounded-2xl border p-1.5 shadow-2xl ${sideClass} ${alignClass} ${
            menuClassName ?? ""
          }`}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      ) : null}
    </div>
  );
}

export default Popover;
