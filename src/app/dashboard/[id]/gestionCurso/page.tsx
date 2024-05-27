'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';

interface Curso {
  id: number;
  nombre: string;
  nominacion: string;
  division: string;
}

const GestionCursos = () => {
  const [nombre, setNombre] = useState('');
  const [nominacion, setNominacion] = useState('');
  const [division, setDivision] = useState('');
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroNominacion, setFiltroNominacion] = useState('');
  const [filtroDivision, setFiltroDivision] = useState('');

  const handleCrearCurso = () => {
    const nuevoCurso: Curso = {
      id: cursos.length + 1,
      nombre,
      nominacion,
      division,
    };
    setCursos([...cursos, nuevoCurso]);
    console.log('Curso creado:', nuevoCurso);
    setNombre('');
    setNominacion('');
    setDivision('');
  };

  const handleModificarCurso = (id: number) => {
    console.log('Modificar curso con ID:', id);
  };

  const handleEliminarCurso = (id: number) => {
    setCursos(cursos.filter(curso => curso.id !== id));
    console.log('Eliminar curso con ID:', id);
  };

  const filteredCursos = cursos.filter(curso => {
    return (
      (filtroNombre === '' || curso.nombre.toLowerCase().includes(filtroNombre.toLowerCase())) &&
      (filtroNominacion === '' || curso.nominacion.toLowerCase().includes(filtroNominacion.toLowerCase())) &&
      (filtroDivision === '' || curso.division.toLowerCase().includes(filtroDivision.toLowerCase()))
    );
  });

  return (
    <Container>
      <h1 className="my-4">Gestionar Cursos</h1>
      <Row className="mb-4">
        <Col md={6}>
          <Form>
            <Form.Group className="mb-3" controlId="formNombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nombre del curso"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formNominacion">
              <Form.Label>Nominación</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nominación del curso"
                value={nominacion}
                onChange={(e) => setNominacion(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDivision">
              <Form.Label>División</Form.Label>
              <Form.Control
                type="text"
                placeholder="División del curso"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleCrearCurso}
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
              Crear Curso
            </Button>
          </Form>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group controlId="filtroNombre">
            <Form.Label>Filtrar por Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre del curso"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="filtroNominacion">
            <Form.Label>Filtrar por Nominación</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nominación del curso"
              value={filtroNominacion}
              onChange={(e) => setFiltroNominacion(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="filtroDivision">
            <Form.Label>Filtrar por División</Form.Label>
            <Form.Control
              type="text"
              placeholder="División del curso"
              value={filtroDivision}
              onChange={(e) => setFiltroDivision(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <h3 className="mb-4">Lista de Cursos</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Nominación</th>
                <th>División</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCursos.map((curso) => (
                <tr key={curso.id}>
                  <td>{curso.nombre}</td>
                  <td>{curso.nominacion}</td>
                  <td>{curso.division}</td>
                  <td>
                    <Button
                      variant="warning"
                      className="me-2"
                      onClick={() => handleModificarCurso(curso.id)}
                    >
                      Modificar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleEliminarCurso(curso.id)}
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

export default GestionCursos;
