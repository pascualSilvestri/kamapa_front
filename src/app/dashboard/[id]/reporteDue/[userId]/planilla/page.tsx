"use client";

import React, { useEffect, useState, useRef } from "react";
import { Container, Table, Button, ButtonProps } from "react-bootstrap";
import { Asignatura, Nota } from "model/types";
import { useInstitucionSelectedContext } from "context/userContext";
import { useCicloLectivo } from "context/CicloLectivoContext";
import styled from "styled-components";
import { Environment } from "utils/EnviromenManager";

const Due = ({ params }: { params: { id: string; userId: string } }) => {
  const { id, userId } = params;
  const [data, setData] = useState<any[]>([]);
  const [institucionSelected] = useInstitucionSelectedContext();
  const [cicloLectivo] = useCicloLectivo();
  const pdfRef = useRef(null);

  useEffect(() => {
    fetchAsignaturasYNotas();
  }, []);

  const fetchAsignaturasYNotas = async () => {
    try {
      const response = await fetch(
        `${Environment.getEndPoint(Environment.endPoint.getNotasByAlumno)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alumnoId: userId,
          }),
        }
      );
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching ciclos lectivos:", error.message);
      } else {
        console.error("Error fetching ciclos lectivos:", error);
      }
    }
  };

  const calculateAverage = (notas: Nota[]) => {
    const evaluacionNotas = notas.filter(nota => nota.tipoNota.tipo === "evaluacion");
    const total = evaluacionNotas.reduce((acc, nota) => acc + nota.nota, 0);
    return evaluacionNotas.length ? (total / evaluacionNotas.length).toFixed(2) : "N/A";
  };

  const calculateFinalNota = (asignatura: any) => {
    const periodosMap: any = {};
    asignatura.notas.forEach((nota: Nota) => {
      const periodoNombre = nota.periodo?.nombre || "Sin Periodo";
      if (!periodosMap[periodoNombre]) {
        periodosMap[periodoNombre] = { notas: [], recuperatorio: null };
      }
      if (nota.tipoNota.tipo === "recuperatorio") {
        periodosMap[periodoNombre].recuperatorio = nota.nota;
      } else {
        periodosMap[periodoNombre].notas.push(nota);
      }
    });

    const notasEvaluacion = Object.keys(periodosMap).map(periodoNombre => ({
      nombre: periodoNombre,
      promedio: calculateAverage(periodosMap[periodoNombre].notas),
      recuperatorio: periodosMap[periodoNombre].recuperatorio,
    }));

    const notaFinalParcial = notasEvaluacion.reduce((acc, periodo) => acc + parseFloat(periodo.promedio), 0) / notasEvaluacion.length;
    const notaFinalParcialRedondeada = notaFinalParcial.toFixed(2);

    const reDiciembre = asignatura.notas.find((nota: Nota) => nota.tipoNota.tipo === "reDiciembre")?.nota || null;
    const reFebrero = asignatura.notas.find((nota: Nota) => nota.tipoNota.tipo === "reFebrero")?.nota || null;

    let notaFinal = notaFinalParcialRedondeada;
    if (notaFinalParcial < 6) {
      if (reDiciembre && reDiciembre >= 6) {
        notaFinal = Math.max(notaFinalParcial, reDiciembre).toFixed(2);
      } else if (reFebrero && reFebrero >= 6) {
        notaFinal = reFebrero.toFixed(2);
      }
    }

    return {
      notasEvaluacion,
      notaFinalParcial: notaFinalParcialRedondeada,
      reDiciembre,
      reFebrero,
      notaFinal,
    };
  };

  return (
    <Container>
      {data.map((ciclo: any) => (
        <div key={ciclo.cicloLectivo.id}>
          <h2>{ciclo.cicloLectivo.nombre}</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Asignatura</th>
                {ciclo.asignaturas[0]?.notas.map((periodo: any, index: number) => (
                  <th key={index}>{periodo.periodo?.nombre || "N/A"}</th>
                ))}
                <th>Nota Final Parcial</th>
                <th>ReDiciembre</th>
                <th>ReFebrero</th>
                <th>Nota Final</th>
              </tr>
            </thead>
            <tbody>
              {ciclo.asignaturas.map((asignatura: any) => {
                const finalNotas = calculateFinalNota(asignatura);
                return (
                  <tr key={asignatura.asignatura.id}>
                    <td>{asignatura.asignatura.nombre}</td>
                    {finalNotas.notasEvaluacion.map((notaEval: any, index: number) => (
                      <td key={index}>{notaEval.promedio}</td>
                    ))}
                    <td>{finalNotas.notaFinalParcial}</td>
                    <td>{finalNotas.reDiciembre}</td>
                    <td>{finalNotas.reFebrero}</td>
                    <td>{finalNotas.notaFinal}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      ))}
    </Container>
  );
};

interface StyledButtonProps extends ButtonProps {
  variant: "purple";
}

const StyledButton = styled(Button)<StyledButtonProps>`
  background-color: purple;
  border-color: purple;
  color: white;
  margin-top: 1rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
    background-color: white;
    color: purple;
    border-color: purple;
  }
`;

export default Due;
