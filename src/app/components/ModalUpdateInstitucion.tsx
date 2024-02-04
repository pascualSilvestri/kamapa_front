import { isNotFoundError } from 'next/dist/client/components/not-found';
import React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

interface ModalUpdateInstitucionProps {
    id: number;
    showEditModal: boolean;
    setShowEditModal: any;
    institucion: any;
    handleSave: any;
    setInstitucion: any;
}

const ModalUpdateInstitucion: React.FC<ModalUpdateInstitucionProps> = ({id,showEditModal,setShowEditModal,institucion,setInstitucion}) => {
    
    const handleFormSubmit =  async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const cue = document.getElementById('formCue').value;
        const nombre = document.getElementById('formNombre').value;
        const localidad = document.getElementById('formLocalidad').value;
        const barrio = document.getElementById('formBarrio').value;
        const calle = document.getElementById('formCalle').value;
        const numero = document.getElementById('formNumero').value;
        const logo = document.getElementById('formLogo').files[0];
        

        const formData = new FormData();
        formData.append('cue', cue);
        formData.append('nombre', nombre);
        formData.append('localidad', localidad);
        formData.append('barrio', barrio);
        formData.append('calle', calle);
        formData.append('numero', numero);
        formData.append('logo', logo);
        formData.append('id', id.toString());
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/institucion/${id}`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();
        setInstitucion(data)
        
        if (response.ok) {
            setShowEditModal(false);
        }

 
        // Aquí puedes hacer lo que necesites con los datos del formulario, como enviarlos a un servidor
    };

    return (
        // JSX del componente
        <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Editar Empleado</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            {institucion && (
                <Form >
                    <Form.Group controlId='formCue'>
                        <Form.Label>Cue</Form.Label>
                        <Form.Control
                            type='text'
                            defaultValue={institucion.cue}
                        />
                    </Form.Group>

                    <Form.Group controlId='formNombre'>
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type='text'
                            defaultValue={institucion.nombre}
                        />
                    </Form.Group>

                    <Form.Group controlId='formLocalidad'>
                        <Form.Label>Localidad</Form.Label>
                        <Form.Control
                            type='text'
                            defaultValue={institucion.domicilioInstitucion?.localidad}
                        />
                    </Form.Group>

                    <Form.Group controlId='formBarrio'>
                        <Form.Label>Barrio</Form.Label>
                        <Form.Control
                            type='text'
                            defaultValue={institucion.domicilioInstitucion?.barrio}
                        />
                    </Form.Group>

                    <Form.Group controlId='formCalle'>
                        <Form.Label>Calle</Form.Label>
                        <Form.Control
                            type='text'
                            defaultValue={institucion.domicilioInstitucion?.calle}
                        />
                    </Form.Group>

                    <Form.Group controlId='formNumero'>
                        <Form.Label>Numero</Form.Label>
                        <Form.Control
                            type='text'
                            defaultValue={institucion.domicilioInstitucion?.numero}
                        />
                    </Form.Group>

                    <Form.Group controlId='formLogo'>
                        <Form.Label>Logo</Form.Label>
                        <Form.Control
                            type='file'
                        />
                    </Form.Group>
                </Form>
            )}
        </Modal.Body>

        <Modal.Footer>
            <Button
                variant='secondary'
                onClick={() => setShowEditModal(false)}>
                Cancelar
            </Button>

            <Button
                variant='primary'
                onClick={handleFormSubmit}>
                Guardar
            </Button>
        </Modal.Footer>
    </Modal>

    );
};

export default ModalUpdateInstitucion;
