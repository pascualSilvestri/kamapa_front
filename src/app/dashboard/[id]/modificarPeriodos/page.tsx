'use client';
import React, { useState, useEffect } from 'react';
import { useCicloLectivo } from 'context/CicloLectivoContext';
import { useUserContext, useInstitucionSelectedContext, useRolesContext } from 'context/userContext';
import { Periodo } from 'model/types';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { Environment } from 'utils/EnviromenManager';

const ModificarPeriodoPage = () => {
    const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
    const [nuevoPeriodo, setNuevoPeriodo] = useState<Periodo>({
        id: 0,
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        cicloId: cicloLectivo.id
    });
    const [showModal, setShowModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [periodoToDelete, setPeriodoToDelete] = useState<number | null>(null);
    const [originalPeriodos, setOriginalPeriodos] = useState<Periodo[]>([]);

    const [user, setUser] = useUserContext();
    const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();
    const [roles, setRoles] = useRolesContext();

    useEffect(() => {
        // Cargar los periodos originales al montar el componente
        setOriginalPeriodos([...cicloLectivo.Periodos]);
    }, []);

    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleChangePeriodo = (e, index) => {
        const { name, value } = e.target;
        const newPeriodos = [...cicloLectivo.Periodos];
        newPeriodos[index] = {
            ...newPeriodos[index],
            [name]: value,
        };
        setCicloLectivo({
            ...cicloLectivo,
            Periodos: newPeriodos,
        });
    };

    const handleAddPeriodo = () => {
        setCicloLectivo({
            ...cicloLectivo,
            Periodos: [...cicloLectivo.Periodos, nuevoPeriodo],
        });
        setNuevoPeriodo({
            id: 0,
            nombre: '',
            fechaInicio: '',
            fechaFin: '',
            cicloId: cicloLectivo.id
        });
    };

    const handleRemovePeriodo = (index) => {
        setPeriodoToDelete(index);
        setShowModal(true);
    };

    const confirmRemovePeriodo = () => {
        const newPeriodos = cicloLectivo.Periodos.filter((_, i) => i !== periodoToDelete);
        setCicloLectivo({
            ...cicloLectivo,
            Periodos: newPeriodos,
        });
        setShowModal(false);
        setPeriodoToDelete(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const getPeriodosDiferenciados = () => {
        const periodosActuales = cicloLectivo.Periodos;
        const periodosNuevos = periodosActuales.filter(periodo => periodo.id === 0);
        const periodosEliminados = originalPeriodos.filter(originalPeriodo => 
            !periodosActuales.some(periodo => periodo.id === originalPeriodo.id)
        );
        const periodosModificados = periodosActuales.filter(periodo => 
            originalPeriodos.some(originalPeriodo => 
                originalPeriodo.id === periodo.id && (
                    originalPeriodo.nombre !== periodo.nombre ||
                    originalPeriodo.fechaInicio !== periodo.fechaInicio ||
                    originalPeriodo.fechaFin !== periodo.fechaFin
                )
            )
        );

        return {
            periodosActuales,
            periodosNuevos,
            periodosEliminados,
            periodosModificados
        };
    };

    const confirmSubmit = async () => {
        const { periodosActuales, periodosNuevos, periodosEliminados, periodosModificados } = getPeriodosDiferenciados();

        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.updatePeriodosForCicloElectivo)}`,{
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                periodosNuevos:periodosNuevos,
                perdiodosEliminados:periodosEliminados,
                periodosModificados:periodosModificados,
                cicloId: cicloLectivo.id
            })
        })

        if (response.status === 200) {
            alert('Los cambios se han guardado correctamente');
        } else {
            alert('Ha ocurrido un error al guardar los cambios');
        }

        const data = await response.json();
        console.log(data);
        if (data.error) {
            alert(data.error);
            return;
        }

        setCicloLectivo({
           ...cicloLectivo,
            Periodos: periodosActuales,
        });

        // Aquí puedes hacer la lógica para guardar los cambios
        setShowConfirmation(false);
    };

    return (
        <Container>
            <h2 className="text-center mt-4">Modificar Ciclo Lectivo</h2>
            <Form onSubmit={handleSubmit}>
                <h3 className="mt-4">Periodos</h3>
                {cicloLectivo.Periodos.map((periodo, index) => (
                    <div key={index} style={{ border: '2px solid purple', padding: '10px', marginBottom: '20px' }}>
                        <Form.Group controlId={`nombre-${index}`}>
                            <Form.Label>Nombre del periodo:</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                value={periodo.nombre}
                                onChange={(e) => handleChangePeriodo(e, index)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId={`fechaInicio-${index}`} className="mt-3">
                            <Form.Label>Fecha de inicio:</Form.Label>
                            <Form.Control
                                type="date"
                                name="fechaInicio"
                                value={formatDate(periodo.fechaInicio)}
                                onChange={(e) => handleChangePeriodo(e, index)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId={`fechaFin-${index}`} className="mt-3">
                            <Form.Label>Fecha de fin:</Form.Label>
                            <Form.Control
                                type="date"
                                name="fechaFin"
                                value={formatDate(periodo.fechaFin)}
                                onChange={(e) => handleChangePeriodo(e, index)}
                                required
                            />
                        </Form.Group>
                        <Button
                            variant="danger"
                            className="mt-3"
                            onClick={() => handleRemovePeriodo(index)}
                        >
                            Eliminar Periodo
                        </Button>
                    </div>
                ))}
                <div className="text-center mt-4">
                    <Button
                        style={{
                            backgroundColor: 'purple',
                            color: 'white',
                            padding: '0.4rem 1rem',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = 'black';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'purple';
                            e.currentTarget.style.color = 'white';
                        }}
                        onClick={handleAddPeriodo}
                        className="mb-3"
                    >
                        Agregar Periodo
                    </Button>
                    <br />
                    <Button
                        style={{
                            backgroundColor: 'purple',
                            color: 'white',
                            padding: '0.4rem 1rem',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = 'black';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'purple';
                            e.currentTarget.style.color = 'white';
                        }}
                        type="submit"
                    >
                        Guardar Cambios
                    </Button>
                </div>
                <br />
                <br />
                <br />
            </Form>

            {/* Modal de confirmación para eliminar periodo */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Está seguro de que desea eliminar este periodo?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmRemovePeriodo}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de confirmación para guardar cambios */}
            <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Guardado</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Está seguro de que desea guardar los cambios realizados?
                </Modal.Body>
                <Modal.Footer>
                    <Button style={{
                        backgroundColor: 'gray',
                        color: 'white',
                        padding: '0.4rem 1rem',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = 'black';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'gray';
                            e.currentTarget.style.color = 'white';
                        }} onClick={() => setShowConfirmation(false)}>
                        Cancelar
                    </Button>
                    <Button style={{
                        backgroundColor: 'purple',
                        color: 'white',
                        padding: '0.4rem 1rem',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = 'black';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'purple';
                            e.currentTarget.style.color = 'white';
                        }} onClick={confirmSubmit}>
                        Guardar Cambios
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ModificarPeriodoPage;
