'use client';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function Modal2({type,isActive,setActivo,setConfirmar}) {

  const typeModal = {
    delete: {
      titulo: 'Eliminar',
      descripcion: '¿Está seguro que desea eliminar el registro?',
      primerboton: 'Eliminar',
      segundoboton: 'Cancelar'
    },
    edit: {
      titulo: 'Modificar',
      descripcion: '¿Está seguro que desea modificar el registro?',
      primerboton: 'Modificar',
      segundoboton: 'Cancelar'
    },
    view: {
      titulo: 'Ver los datos',
      descripcion: '¿Está seguro que desea Ver el registro?',
      primerboton: 'Volver',
      segundoboton: 'Cancelar'
    }
  }



  const {titulo, descripcion, primerboton, segundoboton} = typeModal[type];


  return type == 'delete'? (
    <div
      className="modal show"
      style={{ display: isActive?'block':'none', position: 'absolute', margin:'auto'}}
    >
      <Modal.Dialog>
        <Modal.Header closeButton onHide={() => setActivo(false)}>
          <Modal.Title>{titulo}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>{descripcion}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setActivo(false)} >{segundoboton}</Button>
          <Button variant="primary" onClick={()=>setConfirmar(true)}>{primerboton}</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  ):(
  <div>
    <h1>Soy modificar </h1>
  </div>
  );
}

export default Modal2;
