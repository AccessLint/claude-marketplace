import React from 'react';

// Issue: Modal component with multiple accessibility problems

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  // Issue: No focus management
  // Issue: No keyboard event handlers (Escape key)
  // Issue: No focus trap
  // Issue: No previous focus restoration

  if (!isOpen) return null;

  return (
    // Issue: Missing role="dialog"
    // Issue: Missing aria-modal="true"
    // Issue: Missing aria-labelledby
    // Issue: Clicking overlay closes modal (accessibility issue - should only close on explicit action)
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content">
        {/* Issue: Close button has no accessible label */}
        <button onClick={onClose}>×</button>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// Example usage with more issues:
export function ConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      {/* Issue: Button lacks descriptive text for screen readers */}
      <button onClick={() => setIsOpen(true)}>
        <span>🗑️</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {/* Issue: No heading for modal title (aria-labelledby would reference this) */}
        <div className="modal-title">Confirm Delete</div>
        <p>Are you sure you want to delete this item?</p>

        <div className="modal-actions">
          {/* Issue: Button order not intuitive (destructive action comes first) */}
          {/* Issue: No distinction for screen readers about which is primary action */}
          <button onClick={() => setIsOpen(false)}>Delete</button>
          <button onClick={() => setIsOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
