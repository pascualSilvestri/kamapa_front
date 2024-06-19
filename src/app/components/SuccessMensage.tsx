import { useEffect, useState } from 'react';
import './SuccessMessage.css'; // Estilos para el mensaje de éxito

const SuccessMessage = ({ message, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose(); // Llama a la función para cerrar el mensaje
        }, 3000); // Tiempo en milisegundos antes de desaparecer el mensaje (ejemplo: 3 segundos)

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <>
            {visible && (
                <div className="success-message">
                    <span className="success-text">{message}</span>
                </div>
            )}
        </>
    );
};

export default SuccessMessage;
