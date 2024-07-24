"use client";

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Spinner } from "react-bootstrap";
import { CicloLectivo, Nota } from "model/types";
import { Environment } from "utils/EnviromenManager";
import BarChart from "app/components/BarChart";

const Due = ({ params }: { params: { id: string } }) => {
  const [cursos, setCursos] = useState<any[]>([]);
  const [selectedCicloLectivo, setSelectedCicloLectivo] = useState<string>("");
  const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchCiclosLectivos();
  }, []);

  useEffect(() => {
    if (selectedCicloLectivo) {
      fetchCursosYAlumnos();
    }
  }, [selectedCicloLectivo]);

  const fetchCiclosLectivos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${Environment.getEndPoint(Environment.endPoint.getAllCicloLectivo)}${params.id}`
      );
      const data = await response.json();
      setCiclosLectivos(data);
    } catch (error) {
      console.error("Error fetching ciclos lectivos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCursosYAlumnos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${Environment.getEndPoint(Environment.endPoint.getNotasByCurso)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cicloLectivoId: selectedCicloLectivo,
          }),
        }
      );
      const data = await response.json();
      setCursos(data.cursos);
    } catch (error) {
      console.error("Error fetching cursos y alumnos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCicloLectivoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCicloLectivo(e.target.value);
  };

  const calcularPromedio = (notas: Nota[]) => {
    const evaluaciones = notas.filter(nota => nota.tipoNota?.id === 1);
    if (evaluaciones.length === 0) return 0;
    const total = evaluaciones.reduce((acc, nota) => acc + nota.nota, 0);
    return total / evaluaciones.length;
  };

  const obtenerNotaFinal = (notas: Nota[]) => {
    const periodos = notas.reduce((acc: any, nota: Nota) => {
      if (nota.periodo && nota.periodo.id) {
        if (!acc[nota.periodo.id]) acc[nota.periodo.id] = [];
        acc[nota.periodo.id].push(nota);
      }
      return acc;
    }, {});

    const promedios = Object.values(periodos).map((notasPeriodo: any) =>
      calcularPromedio(notasPeriodo.filter((nota: Nota) => nota.tipoNota?.id === 1))
    );

    const reDiciembre = notas.find(nota => nota.tipoNota?.id === 3);
    const reFebrero = notas.find(nota => nota.tipoNota?.id === 4);

    const promedioPeriodos = promedios.length ? Math.max(...promedios) : 0;
    
    if (reDiciembre && promedioPeriodos < 6) {
      const promedioConReDiciembre = (promedioPeriodos + reDiciembre.nota) / 2;
      return promedioConReDiciembre >= 6 ? promedioConReDiciembre : (reFebrero ? reFebrero.nota : promedioConReDiciembre);
    }

    return promedioPeriodos >= 6 ? promedioPeriodos : (reFebrero ? reFebrero.nota : promedioPeriodos);
  };

  const contarAlumnosReprobados = (alumnos: any) => {
    return alumnos.reduce((acc: any, alumno: any) => {
      alumno.asignaturas.forEach((asignatura: any) => {
        const notaFinal = obtenerNotaFinal(asignatura.notas);
        if (notaFinal < 6) {
          if (!acc[asignatura.asignatura.id]) {
            acc[asignatura.asignatura.id] = {
              nombre: asignatura.asignatura.nombre,
              count: 0,
            };
          }
          acc[asignatura.asignatura.id].count += 1;
        }
      });
      return acc;
    }, {});
  };

  const getChartData = () => {
    const data = cursos.map((curso: any) => {
      const reprobados = contarAlumnosReprobados(curso.alumnos);
      return Object.values(reprobados).map((asignatura: any) => ({
        curso: `${curso.curso.nombre} ${curso.curso.division}`,
        asignatura: asignatura.nombre,
        count: asignatura.count,
      }));
    }).flat();

    const labels = Array.from(new Set(data.map(d => d.asignatura)));
    const datasets = cursos.map((curso: any) => {
      const cursoData = data.filter(d => d.curso === `${curso.curso.nombre} ${curso.curso.division}`);
      return {
        label: `${curso.curso.nombre} ${curso.curso.division}`,
        data: labels.map(label => {
          const asignatura = cursoData.find(d => d.asignatura === label);
          return asignatura ? asignatura.count : 0;
        }),
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
        borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
        borderWidth: 1,
      };
    });

    return {
      labels,
      datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Container>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Seleccione un Ciclo Lectivo</Form.Label>
            <Form.Control
              as="select"
              value={selectedCicloLectivo}
              onChange={handleCicloLectivoChange as any}
            >
              <option value="">Seleccione un ciclo lectivo</option>
              {ciclosLectivos.map((ciclo) => (
                <option key={ciclo.id} value={ciclo.id}>
                  {ciclo.nombre}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          {isLoading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <BarChart data={getChartData()} options={chartOptions} />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Due;
