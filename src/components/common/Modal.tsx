import React from 'react';
import type { ModalProps } from '../../types';

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-instagram-dark/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md border border-instagram-light shadow-xl">
        {children}
      </div>
    </div>
  );
}

export default Modal; 