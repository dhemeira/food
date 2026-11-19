import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface CookCounterProps {
  count: number;
  disabled: boolean;
  onChange: (delta: 1 | -1) => void;
}

function CookCounter({ count, disabled, onChange }: CookCounterProps) {
  return (
    <div className="bg-background/60 flex flex-none items-center gap-1 rounded-full border border-white/[0.16] py-1 pr-1 pl-3 backdrop-blur-md">
      <span className="text-text/70 mr-1 text-[0.625rem] font-semibold tracking-[0.1em] uppercase">
        Főzve
      </span>
      <button
        type="button"
        aria-label="Főzés visszavonása"
        disabled={disabled || count === 0}
        onClick={() => {
          onChange(-1);
        }}
        className="text-text grid size-11 place-items-center rounded-full border border-white/[0.14] bg-white/10 transition-colors hover:bg-white/20 disabled:cursor-default disabled:opacity-40">
        <MinusIcon className="size-4" aria-hidden="true" />
      </button>
      <span aria-live="polite" className="min-w-10 text-center text-sm font-semibold tabular-nums">
        {count}x
      </span>
      <button
        type="button"
        aria-label="Főzés hozzáadása"
        disabled={disabled}
        onClick={() => {
          onChange(1);
        }}
        className="bg-accent text-on-accent hover:bg-accent-hover grid size-11 place-items-center rounded-full border border-transparent transition-colors disabled:cursor-default disabled:opacity-40">
        <PlusIcon className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default CookCounter;
