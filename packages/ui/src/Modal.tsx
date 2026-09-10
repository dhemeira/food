import { useCallback, useId, useRef, type ReactNode } from 'react';
import { XMarkIcon } from './icons';

interface ModalProps {
  trigger: (open: () => void) => ReactNode;
  children: ReactNode;
  title?: string;
  closable?: boolean;
  className?: string;
}

/**
 * Modal dialog built on `<dialog>.showModal()`.
 *
 * `showModal()` makes everything behind the dialog inert, so background
 * controls cannot be interacted with while the modal is open.
 *
 * Usage:
 * ```tsx
 * <Modal
 *   title="Delete"
 *   trigger={(open) => <Button onClick={open}>Delete</Button>}>
 *   <p>Are you sure you want to delete this?</p>
 *   <Button data-modal-close onClick={() => void handleDelete()}>Delete</Button>
 *   <Button data-modal-close>Cancel</Button>
 * </Modal>
 * ```
 *
 * - `trigger` receives an `open` function to show the modal.
 * - Any element inside marked `data-modal-close` closes the modal.
 * - Escape always closes it. `closable` also enables close on backdrop click.
 */
function Modal({ trigger, children, title, closable = false, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const open = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  function handleClick(event: React.MouseEvent<HTMLDialogElement>): void {
    if (closable && event.target === dialogRef.current) {
      close();
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest<HTMLElement>('[data-modal-close]')) {
      close();
    }
  }

  return (
    <>
      {trigger(open)}
      <dialog
        ref={dialogRef}
        aria-labelledby={title ? titleId : undefined}
        onClick={handleClick}
        className={`ui-modal border-ui-surface-2 bg-ui-surface-2 text-ui-text m-auto max-h-[min(85dvh,40rem)] w-[min(92vw,32rem)] overflow-y-auto rounded-2xl border-2 p-6 shadow-2xl ${className ?? ''}`}>
        {title ? (
          <div className="flex items-center justify-between gap-4">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <button
              type="button"
              aria-label="Bezárás"
              data-modal-close
              className="text-ui-text/60 hover:text-ui-text -m-1 shrink-0 rounded-full p-1 transition-colors">
              <XMarkIcon className="size-5" />
            </button>
          </div>
        ) : null}
        {children}
      </dialog>
    </>
  );
}

export default Modal;
