import { useEffect, useState } from 'react';

export function usePopoverOpen(id: string): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;

    const onToggle = () => {
      setOpen(el.matches(':popover-open'));
    };

    el.addEventListener('toggle', onToggle);
    return () => {
      el.removeEventListener('toggle', onToggle);
    };
  }, [id]);

  return open;
}
