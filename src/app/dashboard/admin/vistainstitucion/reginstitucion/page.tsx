import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Modal } from 'react-bootstrap';
import useFormStatus from './../../../../components/useFormStatus';

interface Provincia {
    provinciaId: string;
    provincia: string;
}

interface FormData {
    institucion: {
        cue: string;
        logo: any;
        nombre: string;
        descripcion: string;
    };
    domicilio: {
        calle: string;
        numero: string;
        barrio: string;
        localidad: string;
        provinciaId: string;
    };
    contacto: {
        contacto: string;
        email: string;
    };
}

const RegInstitucionPage = () => {
    const [formState, setFormState] = useState<FormData>({
        institucion: {
            cue: '',
            logo: new File([], ''),
            nombre: '',
            descripcion: '',
        },
        domicilio: {
            calle: '',
            numero: '',
            barrio: '',
            localidad: '',
            provinciaId: '',
        },
        contacto: {
            contacto: '',
            email: '',
        },
    });

    const [provincias, setProvincias] = useState<Provincia[]>([]);
    const { status, setStatus, resetStatus } = useFormStatus();
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        const fieldNames = name.split('.');
        setFormState((prevFormState) => {
            const updatedFormState = { ...prevFormState };
            let currentState = updatedFormState;
            for (let i = 0; i < fieldNames.length - 1; i++) {
                currentState = currentState[fieldNames[i]];
            }
            currentState[fieldNames[fieldNames.length - 1]] = value;
            return updatedFormState;
        });
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormState((prevFormState) => ({
                ...prevFormState,
                institucion: {
                    ...prevFormState.institucion,
                    logo: file,
                },
            }));
        }
    };

    useEffect(() => {
        const fetchProvincias = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/provincia`);
                if (response.ok) {
                    const data = await response.json();
                    setProvincias(data);
                } else {
                    console.error('Error al cargar las provincias');
                }
            } catch (error) {
                console.error('Error al cargar las provincias:', error);
            }
        };

        fetchProvincias();
    }, []);

    const resetForm = () => {
        return {
            institucion: {
                cue: '',
                logo: new File([], ''),
                nombre: '',
                descripcion: '',
            },
            domicilio: {
                calle: '',
                numero: '',
                barrio: '',
                localidad: '',
                provinciaId: '',
            },
            contacto: {
                contacto: '',
                email: '',
            },
        };
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('cue', formState.institucion.cue);
        formData.append('logo', formState.institucion.logo, formState.institucion.logo.name);
        formData.append('nombre', formState.institucion.nombre);
        formData.append('descripcion', formState.institucion.descripcion);
        formData.append('calle', formState.domicilio.calle);
        formData.append('numero', formState.domicilio.numero);
        formData.append('barrio', formState.domicilio.barrio);
        formData.append('localidad', formState.domicilio.localidad);
        formData.append('provinciaId', formState.domicilio.provinciaId);
        formData.append('contacto', formState.contacto.contacto);
        formData.append('email', formState.contacto.email);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/institucion`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setModalMessage('Institución registrada con éxito');
                setShowModal(true);
                setFormState(resetForm());
            } else {
                setStatus('error');
                setModalMessage('Error al registrar la institución');
                setShowModal(true);
                console.log('Error al registrar la institución', data);
            }
        } catch (error) {
            setStatus('error');
            setModalMessage('Error al registrar la institución');
            setShowModal(true);
            console.error('Error al registrar la institución', error);
        }
    };

    return (
        <Container className='p-3'>
            <Form onSubmit={handleSubmit}>
                {/* Form fields and buttons go here */}
                <Row className='mb-3'>
                    <Col sm={6}>
                        <Form.Group controlId='provinciaId'>
                            <Form.Label>Provincia *</Form.Label>
                            <Form.Control
                                as='select'
                                name='domicilio.provinciaId'
                                value={formState.domicilio.provinciaId}
                                onChange={handleChange}
                                required>
                                <option value=''>Selecciona una provincia</option>
                                {provincias.map((provincia) => (
                                    <option key={provincia.provinciaId} value={provincia.provinciaId}>
                                        {provincia.provincia}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                {/* Additional form fields and modal */}
            </Form>
        </Container>
    );
};

export default RegInstitucionPage;
