import React from "react";
import { Modal } from "react-bootstrap";

interface IModalViewInstitucion {
  institucion: any;
  showModal: boolean;
  setShowModal: any;
}

const ModalViewInstitucion: React.FC<IModalViewInstitucion> = ({institucion,showModal,setShowModal}) => {
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton onClick={()=>setShowModal(false)}>
        <Modal.Title>Detalles del Empleado</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {institucion && (
          <>
            <p>Cue: {institucion?.cue}</p>
            <p>
              descripcion :{institucion?.descripcion}
            </p>
            <p>
              Domiciolio:{institucion.domicilioInstitucion?.calle}
            </p>
            <p>Nombre: {institucion?.nombre}</p>
            <p>Tel: {institucion.contactoInstitucion?.contacto}</p>
            <p>Email: {institucion.contactoInstitucion?.email}</p>
            <p>
              Estado:{" "}
              {institucion?.isActive
                ? "Activo"
                : "Inactivo"}
            </p>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ModalViewInstitucion;
