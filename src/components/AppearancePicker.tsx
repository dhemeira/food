import { useState } from 'react';
import { applyTheme, getInitialTheme, THEMES, THEME_DETAILS, type ThemeName } from '~/lib/theme';

function AppearancePicker() {
  const [theme, setTheme] = useState<ThemeName>(getInitialTheme);

  return (
    <footer className="border-border mt-8 flex items-center justify-end border-t pt-6">
      <div className="flex items-center gap-1" role="group" aria-label="Megjelenés">
        {THEMES.map((name) => (
          <button
            key={name}
            type="button"
            className="theme-swatch"
            data-theme-set={name}
            aria-label={THEME_DETAILS[name].label}
            aria-pressed={theme === name}
            onClick={() => {
              setTheme(name);
              applyTheme(name);
            }}
          />
        ))}
      </div>
    </footer>
  );
}

export default AppearancePicker;
