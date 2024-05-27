'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';

interface Asignatura {
  id: number;
  nombre: string;
  cursoAsociado?: string;
}

const GestionAsignaturas = () => {
  const [nombre, setNombre] = useState('');
  const [cursoAsociado, setCursoAsociado] = useState('');
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [cursos, setCursos] = useState<string[]>(['Curso 1', 'Curso 2', 'Curso 3']); // Ejemplo de cursos
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');

  const handleCrearAsignatura = () => {
    const nuevaAsignatura: Asignatura = {
      id: asignaturas.length + 1,
      nombre,
      cursoAsociado: cursoAsociado || undefined,
    };
    setAsignaturas([...asignaturas, nuevaAsignatura]);
    console.log('Asignatura creada:', nuevaAsignatura);
    setNombre('');
    setCursoAsociado('');
  };

  const handleModificarAsignatura = (id: number) => {
    console.log('Modificar asignatura con ID:', id);
  };

  const handleEliminarAsignatura = (id: number) => {
    setAsignaturas(asignaturas.filter(asignatura => asignatura.id !== id));
    console.log('Eliminar asignatura con ID:', id);
  };

  const filteredAsignaturas = asignaturas.filter(asignatura => {
    return (
      (filtroNombre === '' || asignatura.nombre.toLowerCase().includes(filtroNombre.toLowerCase())) &&
      (filtroCurso === '' || (asignatura.cursoAsociado && asignatura.cursoAsociado.toLowerCase().includes(filtroCurso.toLowerCase())))
    );
  });

  return (
    <Container>
      <h1 className="my-4">Gestionar Asignaturas</h1>
      <Row className="mb-4">
        <Col md={6}>
          <Form>
            <Form.Group className="mb-3" controlId="formNombre">
              <Form.Label>Nombre de la Asignatura</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nombre de la asignatura"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formCursoAsociado">
              <Form.Label>Curso Asociado (opcional)</Form.Label>
              <Form.Control
                as="select"
                value={cursoAsociado}
                onChange={(e) => setCursoAsociado(e.target.value)}
              >
                <option value="">Seleccionar curso</option>
                {cursos.map((curso, index) => (
                  <option key={index} value={curso}>
                    {curso}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleCrearAsignatura}
              style={{
                backgroundColor: 'purple',
                color: 'white',
                padding: '0.4rem 1rem',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                border: '2px solid purple',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = 'purple';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'purple';
                e.currentTarget.style.color = 'white';
              }}
            >
              Crear Asignatura
            </Button>
          </Form>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formFiltroNombre">
            <Form.Label>Filtrar por Nombre de la Asignatura</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre de la asignatura"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formFiltroCurso">
            <Form.Label>Filtrar por Curso Asociado</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre del curso"
              value={filtroCurso}
              onChange={(e) => setFiltroCurso(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <h3 className="mb-4">Lista de Asignaturas</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Curso Asociado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAsignaturas.map((asignatura) => (
                <tr key={asignatura.id}>
                  <td>{asignatura.nombre}</td>
                  <td>{asignatura.cursoAsociado || 'No asociado'}</td>
                  <td>
                    <Button
                      variant="warning"
                      className="me-2"
                      onClick={() => handleModificarAsignatura(asignatura.id)}
                    >
                      Modificar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleEliminarAsignatura(asignatura.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default GestionAsignaturas;
