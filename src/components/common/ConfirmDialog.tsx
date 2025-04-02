import React from 'react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}) => {
  console.log("Renderizando ConfirmDialog, isOpen:", isOpen);
  
  if (!isOpen) return null;

  // Detener la propagación de eventos para evitar que se cierren inesperadamente
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={handleDialogClick}>
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-buttons">
          <button 
            className="confirm-dialog-button confirm-dialog-button-cancel" 
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button 
            className="confirm-dialog-button confirm-dialog-button-confirm" 
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 