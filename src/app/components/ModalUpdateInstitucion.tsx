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

const ModalUpdateInstitucion: React.FC<ModalUpdateInstitucionProps> = ({ id, showEditModal, setShowEditModal, institucion, setInstitucion }) => {
    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Asegúrate de que los elementos sean tratados como HTMLInputElement para acceder a la propiedad 'value'
        const cue = (document.getElementById('formCue') as HTMLInputElement).value;
        const nombre = (document.getElementById('formNombre') as HTMLInputElement).value;
        const localidad = (document.getElementById('formLocalidad') as HTMLInputElement).value;
        const barrio = (document.getElementById('formBarrio') as HTMLInputElement).value;
        const calle = (document.getElementById('formCalle') as HTMLInputElement).value;
        const numero = (document.getElementById('formNumero') as HTMLInputElement).value;
        // Asegúrate de que el elemento sea tratado como HTMLInputElement para acceder a la propiedad 'files'
        const logo = (document.getElementById('formLogo') as HTMLInputElement).files[0];

        const formData = new FormData();
        formData.append('cue', cue);
        formData.append('nombre', nombre);
        formData.append('localidad', localidad);
        formData.append('barrio', barrio);
        formData.append('calle', calle);
        formData.append('numero', numero);
        if (logo) formData.append('logo', logo);
        formData.append('id', id.toString());

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/institucion/${id}`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();
        setInstitucion(data);

        if (response.ok) {
            setShowEditModal(false);
        }
    };

    return (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Editar Institución</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {institucion && (
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group controlId='formCue'>
                            <Form.Label>Cue</Form.Label>
                            <Form.Control type='text' defaultValue={institucion.cue} />
                        </Form.Group>

                        <Form.Group controlId='formNombre'>
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type='text' defaultValue={institucion.nombre} />
                        </Form.Group>

                        <Form.Group controlId='formLocalidad'>
                            <Form.Label>Localidad</Form.Label>
                            <Form.Control type='text' defaultValue={institucion.domicilioInstitucion?.localidad} />
                        </Form.Group>

                        <Form.Group controlId='formBarrio'>
                            <Form.Label>Barrio</Form.Label>
                            <Form.Control type='text' defaultValue={institucion.domicilioInstitucion?.barrio} />
                        </Form.Group>

                        <Form.Group controlId='formCalle'>
                            <Form.Label>Calle</Form.Label>
                            <Form.Control type='text' defaultValue={institucion.domicilioInstitucion?.calle} />
                        </Form.Group>

                        <Form.Group controlId='formNumero'>
                            <Form.Label>Número</Form.Label>
                            <Form.Control type='text' defaultValue={institucion.domicilioInstitucion?.numero} />
                        </Form.Group>

                        <Form.Group controlId='formLogo'>
                            <Form.Label>Logo</Form.Label>
                            <Form.Control type='file' />
                        </Form.Group>
                    </Form>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant='secondary' onClick={() => setShowEditModal(false)}>
                    Cancelar
                </Button>

                <Button variant='primary' type="submit">
                    Guardar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalUpdateInstitucion;
