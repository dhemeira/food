interface LogoProps {
  className?: string;
}

/**
 * Inline app mark. Kept filter-free on purpose: iOS rasterizes filtered SVGs
 * at low resolution, which made the header icon look blurry.
 */
function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="food-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#food-logo-bg)" />
      <g transform="translate(256 256) scale(0.36) translate(-480 480)" fill="#ffffff">
        <path d="M320-80v-70q-107-42-173.5-130T80-480h80v-320l720-80v60l-460 52v68h460v60H420v160h460q0 112-66.5 200T640-150v70H320Zm0-620h40v-62l-40 5v57Zm-100 0h40v-50l-40 4v46Zm100 220h40v-160h-40v160Zm-100 0h40v-160h-40v160Z" />
      </g>
    </svg>
  );
}

export default Logo;
