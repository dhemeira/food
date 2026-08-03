import type { ReactNode, MouseEvent } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}>
      <div
        className="bg-surface w-full max-w-sm rounded-2xl p-6 shadow-lg"
        onClick={(event: MouseEvent) => {
          event.stopPropagation();
        }}>
        <h2 className="text-text text-xl font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default Modal;
