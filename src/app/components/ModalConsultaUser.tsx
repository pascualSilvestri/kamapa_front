'use Client'
import React from 'react';

// Componente Modal
const Modal = ({ children, onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '8px',
                width: '80%',
                maxHeight: '80%',
                overflowY: 'auto',
            }}>
                <button onClick={onClose} style={{ float: 'right' }}>Cerrar</button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
