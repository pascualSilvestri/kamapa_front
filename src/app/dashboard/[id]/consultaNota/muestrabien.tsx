

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Container, Row, Col, Form, Table, Button, ButtonProps } from 'react-bootstrap';
// import { Asignatura, Nota, Periodo, CicloLectivo } from 'model/types';
// import { useUserContext, useInstitucionSelectedContext } from 'context/userContext';
// import { useCicloLectivo } from 'context/CicloLectivoContext';
// import styled from 'styled-components';
// import { Environment } from 'utils/EnviromenManager';

// const ConsultaNota = ({ params }: { params: { id: string } }) => {
//     const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
//     const [periodos, setPeriodos] = useState<Periodo[]>([]);
//     const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>([]);
//     const [user] = useUserContext();
//     const [institucionSelected] = useInstitucionSelectedContext();
//     const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
//     const [selectedCicloLectivo, setSelectedCicloLectivo] = useState<string>(cicloLectivo ? cicloLectivo.id.toString() : '');

//     useEffect(() => {
//         fetchCiclosLectivos();
//         fetchAsignaturasYNotas();
//     }, []);

//     useEffect(() => {
//         if (selectedCicloLectivo) {
            
//         }
//     }, [selectedCicloLectivo]);

//     const fetchCiclosLectivos = async () => {
//         try {
//             const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getAllCicloLectivo)}${params.id}`);
//             const data = await response.json();
//             setCiclosLectivos(data);
//             const activeCiclo = data.find((ciclo: CicloLectivo) => ciclo.isActive);
//             if (activeCiclo) {
//                 setSelectedCicloLectivo(activeCiclo.id.toString());
//             }
//         } catch (error) {
//             console.error('Error fetching ciclos lectivos:', error);
//         }
//     };

//     const fetchAsignaturasYNotas = async () => {
//         try {
//             const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getNotasByAlumnoForCicloElectivo)}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     alumnoId: user.id,
//                     cicloLectivoId: selectedCicloLectivo,
//                 })
//             });
//             const data = await response.json();
//             console.log('Fetched data:', data);
//             const periodosUnicos: Periodo[] = [];
//             data.forEach((item: { asignatura: Asignatura, notas: Nota[] }) => {
//                 item.notas.forEach((nota: Nota) => {
//                     if (!periodosUnicos.find(periodo => periodo.id === nota.periodo.id)) {
//                         periodosUnicos.push(nota.periodo);
//                     }
//                 });
//             });
//             setPeriodos(periodosUnicos);
//             setAsignaturas(data.map((item: { asignatura: Asignatura, notas: Nota[] }) => ({ ...item.asignatura, notas: item.notas })));
//         } catch (error) {
//             console.error('Error fetching asignaturas y notas:', error);
//         }
//     };

//     const calcularPromedioPorPeriodo = (notas: Nota[], periodoId: number) => {
//         const notasDelPeriodo = notas.filter(nota => nota.periodoId === periodoId);
//         if (notasDelPeriodo.length === 0) return '-';
//         const total = notasDelPeriodo.reduce((acc, nota) => acc + nota.nota, 0);
//         return (total / notasDelPeriodo.length).toFixed(2);
//     };

//     const calcularPromedioGeneral = (notas: Nota[]) => {
//         if (notas.length === 0) return '-';
//         const notasAPromediadas = notas.map(nota => {
//             const promedioPorPeriodo = parseFloat(calcularPromedioPorPeriodo([nota], nota.periodoId));
//             const periodoRecuperado = periodos.find(periodo => periodo.id === nota.periodoId && promedioPorPeriodo < 6);
//             return periodoRecuperado ? 0 : nota.nota;
//         });
//         const total = notasAPromediadas.reduce((acc, nota) => acc + nota, 0);
//         return (total / notasAPromediadas.length).toFixed(2);
//     };

//     const asignaturasARecuperar = asignaturas.filter(asignatura =>
//         periodos.some(periodo => parseFloat(calcularPromedioPorPeriodo(asignatura.notas, periodo.id)) < 6)
//     );

//     return (
//         <Container>
//             <Row>
//                 <Col>
//                     <h1>Consulta de Notas</h1>
//                     {/* aqui se puede poner el nombre de curso y division a la que pertenecen estas notas */}
//                 </Col>
//             </Row>
//             <Row>
//                 <Col md={6}>
//                     <Form.Group controlId="selectCicloLectivo">
//                         <Form.Label>Seleccionar Ciclo Lectivo</Form.Label>
//                         <Form.Control
//                             as="select"
//                             value={selectedCicloLectivo}
//                             onChange={async (e) => {
//                                 const cicloId = e.target.value;
//                                 setSelectedCicloLectivo(cicloId);
//                                 const ciclo = ciclosLectivos.find(ciclo => ciclo.id.toString() === cicloId) || null;
//                                 setCicloLectivo(ciclo);
//                                 await fetchAsignaturasYNotas();
//                             }}
//                         >
//                             {ciclosLectivos.length > 0 && ciclosLectivos.map(ciclo => (
//                                 <option key={ciclo.id} value={ciclo.id}>
//                                     {ciclo.nombre}
//                                 </option>
//                             ))}
//                         </Form.Control>
//                     </Form.Group>
//                 </Col>
//             </Row>
//             <Row>
//                 <Col>
//                     <h2>Asignaturas y Notas</h2>
//                     <div style={{ overflowX: 'auto' }}>
//                         <Table responsive striped bordered hover>
//                             <thead>
//                                 <tr>
//                                     <th style={{ backgroundColor: 'purple', color: 'white' }}>Asignatura</th>
//                                     {periodos.map(periodo => (
//                                         <th style={{ backgroundColor: 'purple', color: 'white' }} colSpan={7} key={periodo.id}>
//                                             {periodo.nombre}
//                                         </th>
//                                     ))}
//                                     <th style={{ backgroundColor: 'purple', color: 'white' }}>Promedio General</th>
//                                 </tr>
//                                 <tr>
//                                     <th style={{ backgroundColor: 'purple', color: 'white' }}></th>
//                                     {periodos.flatMap(periodo => [
//                                         <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N1`}>N1</th>,
//                                         <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N2`}>N2</th>,
//                                         <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N3`}>N3</th>,
//                                         <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N4`}>N4</th>,
//                                         <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N5`}>N5</th>,
//                                         <th style={{ backgroundColor: 'red', color: 'white' }} key={`${periodo.id}-PR`}>PR</th>,
//                                         <th style={{ backgroundColor: 'lightgreen' }} key={`${periodo.id}-promedio`}>Promedio</th>
//                                     ])}
//                                     <th style={{ backgroundColor: 'purple', color: 'white' }}></th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {asignaturas.map(asignatura => (
//                                     <tr key={asignatura.id}>
//                                         <td>{asignatura.nombre}</td>
//                                         {periodos.flatMap((periodo, index) => [
//                                             <td key={`${asignatura.id}-${periodo.id}-nota1`}>{asignatura.notas[index * 5]?.nota ?? '-'}</td>,
//                                             <td key={`${asignatura.id}-${periodo.id}-nota2`}>{asignatura.notas[index * 5 + 1]?.nota ?? '-'}</td>,
//                                             <td key={`${asignatura.id}-${periodo.id}-nota3`}>{asignatura.notas[index * 5 + 2]?.nota ?? '-'}</td>,
//                                             <td key={`${asignatura.id}-${periodo.id}-nota4`}>{asignatura.notas[index * 5 + 3]?.nota ?? '-'}</td>,
//                                             <td key={`${asignatura.id}-${periodo.id}-nota5`}>{asignatura.notas[index * 5 + 4]?.nota ?? '-'}</td>,
//                                             <td style={{ backgroundColor: 'red', color: 'white' }} key={`${asignatura.id}-${periodo.id}-PR`}>{parseFloat(calcularPromedioPorPeriodo(asignatura.notas, periodo.id)) < 6 ? asignatura.notas.find(nota => nota.periodoId === periodo.id)?.nota || '-' : '-'}</td>,
//                                             <td style={{ backgroundColor: 'lightgreen' }} key={`${asignatura.id}-${periodo.id}-promedio`}>{calcularPromedioPorPeriodo(asignatura.notas, periodo.id)}</td>
//                                         ])}
//                                         <td style={{ backgroundColor: 'purple', color: 'white' }}>{calcularPromedioGeneral(asignatura.notas)}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </Table>
//                     </div>
//                 </Col>
//             </Row>
//             <Row>
//                 <Col>
//                     <h2>Asignaturas a Recuperar en Diciembre</h2>
//                     <div style={{ overflowX: 'auto' }}>
//                         <Table responsive striped bordered hover>
//                             <thead>
//                                 <tr>
//                                     <th>Asignatura</th>
//                                     <th>Promedio General</th>
//                                     <th style={{ backgroundColor: 'purple', color: 'white', textAlign: 'center' }}>Nota Final</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {asignaturas.filter(asignatura => parseFloat(calcularPromedioGeneral(asignatura.notas)) < 6).map(asignatura => (
//                                     <tr key={asignatura.id}>
//                                         <td>{asignatura.nombre}</td>
//                                         <td>{calcularPromedioGeneral(asignatura.notas)}</td>
//                                         <td style={{ backgroundColor: 'purple', color: 'white', textAlign: 'center' }}>{asignatura.notas[0]?.nota || '-'}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </Table>
//                     </div>
//                 </Col>
//             </Row>
//             <Row className="justify-content-center mb-4">
//                 <Col xs="auto">
//                     <StyledButton variant="purple" className="mx-2">
//                         Visualizar PDF Analítico Provisorio
//                     </StyledButton>
//                 </Col>
//                 <Col xs="auto">
//                     <StyledButton variant="purple" className="mx-2">
//                         Visualizar PDF DUE
//                     </StyledButton>
//                 </Col>
//             </Row>
//         </Container>
//     );
// };

// interface StyledButtonProps extends ButtonProps {
//     variant: 'purple';
// }

// const StyledButton = styled(Button)<StyledButtonProps>`
//     background-color: purple;
//     border-color: purple;
//     color: white;
//     margin-top: 1rem;
//     transition: transform 0.3s ease;

//     &:hover {
//       transform: scale(1.1);
//       background-color: white;
//       color: purple;
//       border-color: purple;
//     }
// `;

// export default ConsultaNota;


//////////////////////////////////////////////// Codigo Bueno que muestra todo /////////////////////////
// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Container, Row, Col, Form, Table, Button, ButtonProps } from 'react-bootstrap';
// import { Asignatura, Nota, Periodo, CicloLectivo } from 'model/types';
// import { useUserContext, useInstitucionSelectedContext } from 'context/userContext';
// import { useCicloLectivo } from 'context/CicloLectivoContext';
// import styled from 'styled-components';
// import { Environment } from 'utils/EnviromenManager';

// const ConsultaNota = ({ params }: { params: { id: string } }) => {
//     const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
//     const [periodos, setPeriodos] = useState<Periodo[]>([]);
//     const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>([]);
//     const [user] = useUserContext();
//     const [institucionSelected] = useInstitucionSelectedContext();
//     const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
//     const [selectedCicloLectivo, setSelectedCicloLectivo] = useState<string>(cicloLectivo ? cicloLectivo.id.toString() : '');

//     useEffect(() => {
//         fetchCiclosLectivos();
//     }, []);

//     useEffect(() => {
//         if (selectedCicloLectivo) {
//             fetchAsignaturasYNotas();
//         }
//     }, [selectedCicloLectivo]);

//     const fetchCiclosLectivos = async () => {
//         try {
//             const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getAllCicloLectivo)}${params.id}`);
//             const data = await response.json();
//             setCiclosLectivos(data);
//             const activeCiclo = data.find((ciclo: CicloLectivo) => ciclo.isActive);
//             if (activeCiclo) {
//                 setSelectedCicloLectivo(activeCiclo.id.toString());
//             }
//         } catch (error) {
//             console.error('Error fetching ciclos lectivos:', error);
//         }
//     };

//     const fetchAsignaturasYNotas = async () => {
//         try {
//             const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getNotasByAlumnoForCicloElectivo)}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     alumnoId: user.id,
//                     cicloLectivoId: selectedCicloLectivo,
//                 })
//             });
//             const data = await response.json();
//             console.log('Fetched data:', data);

//             const periodosUnicos: Periodo[] = [];
//             data.forEach((item: { asignatura: Asignatura, notas: Nota[] }) => {
//                 item.notas.forEach((nota: Nota) => {
//                     if (!periodosUnicos.find(periodo => periodo.id === nota.periodo.id)) {
//                         periodosUnicos.push(nota.periodo);
//                     }
//                 });
//             });

//             // Ordenar periodos por fecha de creación
//             periodosUnicos.sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());

//             setPeriodos(periodosUnicos);

//             const asignaturasConNotas = data.map((item: { asignatura: Asignatura, notas: Nota[] }) => {
//                 const notasPorPeriodo: { [key: number]: Nota[] } = {};
//                 periodosUnicos.forEach(periodo => {
//                     notasPorPeriodo[periodo.id] = item.notas.filter(nota => nota.periodo.id === periodo.id);
//                 });
//                 return { ...item.asignatura, notasPorPeriodo };
//             });

//             setAsignaturas(asignaturasConNotas);
//         } catch (error) {
//             console.error('Error fetching asignaturas y notas:', error);
//         }
//     };

//     const calcularPromedioPorPeriodo = (notas: Nota[]) => {
//         const evaluaciones = notas.filter(nota => nota.tipoNota?.id === 1);
//         if (evaluaciones.length === 0) return '-';
//         const total = evaluaciones.reduce((acc, nota) => acc + nota.nota, 0);
//         return (total / evaluaciones.length).toFixed(2);
//     };

//     const calcularPromedioGeneral = (notasPorPeriodo: { [key: number]: Nota[] }) => {
//         const todasLasNotas = Object.values(notasPorPeriodo).flat();
//         const evaluaciones = todasLasNotas.filter(nota => nota.tipoNota?.id === 1);
//         if (evaluaciones.length === 0) return '-';
//         const total = evaluaciones.reduce((acc, nota) => acc + nota.nota, 0);
//         return (total / evaluaciones.length).toFixed(2);
//     };

//     return (
//         <Container>
//             <Row>
//                 <Col>
//                     <h1>Consulta de Notas</h1>
//                     {/* aquí se puede poner el nombre de curso y división a la que pertenecen estas notas */}
//                 </Col>
//             </Row>
//             <Row>
//                 <Col md={6}>
//                     <Form.Group controlId="selectCicloLectivo">
//                         <Form.Label>Seleccionar Ciclo Lectivo</Form.Label>
//                         <Form.Control
//                             as="select"
//                             value={selectedCicloLectivo}
//                             onChange={async (e) => {
//                                 const cicloId = e.target.value;
//                                 setSelectedCicloLectivo(cicloId);
//                                 const ciclo = ciclosLectivos.find(ciclo => ciclo.id.toString() === cicloId) || null;
//                                 setCicloLectivo(ciclo);
//                                 // await fetchAsignaturasYNotas();
//                             }}
//                         >
//                             {ciclosLectivos.length > 0 && ciclosLectivos.map(ciclo => (
//                                 <option key={ciclo.id} value={ciclo.id}>
//                                     {ciclo.nombre}
//                                 </option>
//                             ))}
//                         </Form.Control>
//                     </Form.Group>
//                 </Col>
//             </Row>
//             <Row>
//                 <Col>
//                     <h2>Asignaturas y Notas</h2>
//                     <div style={{ overflowX: 'auto' }}>
//                         <Table responsive striped bordered hover>
//                             <thead>
//                                 <tr>
//                                     <th style={{ backgroundColor: 'purple', color: 'white' }}>Asignatura</th>
//                                     {periodos.map(periodo => (
//                                         <th style={{ backgroundColor: 'purple', color: 'white' }} colSpan={7} key={periodo.id}>
//                                             {periodo.nombre}
//                                         </th>
//                                     ))}
//                                     <th style={{ backgroundColor: 'purple', color: 'white' }}>Promedio General</th>
//                                 </tr>
//                                 <tr>
//                                     <th></th>
//                                     {periodos.flatMap(periodo => [
//                                         <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N1`}>N1</th>,
//                                         <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N2`}>N2</th>,
//                                         <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N3`}>N3</th>,
//                                         <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N4`}>N4</th>,
//                                         <th style={{ backgroundColor: 'purple', color: 'white' }} key={`${periodo.id}-N5`}>N5</th>,
//                                         <th style={{ backgroundColor: 'red', color: 'white' }} key={`${periodo.id}-Coloquio`}>Coloquio</th>,
//                                         <th style={{ backgroundColor: 'lightgreen' }} key={`${periodo.id}-Promedio`}>Promedio</th>
//                                     ])}
//                                     <th></th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {asignaturas.map(asignatura => (
//                                     <tr key={asignatura.id}>
//                                         <td>{asignatura.nombre}</td>
//                                         {periodos.flatMap(periodo => {
//                                             const notas = asignatura.notasPorPeriodo[periodo.id] || [];
//                                             const coloquioNota = notas.find(nota => nota.tipoNota?.id === 2);
//                                             const promedio = calcularPromedioPorPeriodo(notas);
//                                             return (
//                                                 <>
//                                                     {notas.filter(nota => nota.tipoNota?.id === 1).map((nota, idx) => (
//                                                         <td key={`${asignatura.id}-${periodo.id}-N${idx + 1}`}>{nota.nota}</td>
//                                                     ))}
//                                                     {new Array(5 - notas.filter(nota => nota.tipoNota?.id === 1).length).fill(null).map((_, idx) => (
//                                                         <td key={`${asignatura.id}-${periodo.id}-empty-${idx}`}>-</td>
//                                                     ))}
//                                                     <td key={`${asignatura.id}-${periodo.id}-Coloquio`} style={{ backgroundColor: 'red', color: 'white' }}>{coloquioNota ? coloquioNota.nota : '-'}</td>
//                                                     <td key={`${asignatura.id}-${periodo.id}-Promedio`} style={{ backgroundColor: 'lightgreen' }}>{promedio}</td>
//                                                 </>
//                                             );
//                                         })}
//                                         <td style={{ backgroundColor: 'purple', color: 'white' }}>{calcularPromedioGeneral(asignatura.notasPorPeriodo)}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </Table>
//                     </div>
//                 </Col>
//             </Row>
//             <Row>
//                 <Col>
//                     <h2>Asignaturas a Recuperar en Diciembre</h2>
//                     <div style={{ overflowX: 'auto' }}>
//                         <Table responsive striped bordered hover>
//                             <thead>
//                                 <tr>
//                                     <th>Asignatura</th>
//                                     <th>Promedio General</th>
//                                     <th style={{ backgroundColor: 'purple', color: 'white', textAlign: 'center' }}>Nota Final</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {asignaturas.filter(asignatura => parseFloat(calcularPromedioGeneral(asignatura.notasPorPeriodo)) < 6).map(asignatura => (
//                                     <tr key={asignatura.id}>
//                                         <td>{asignatura.nombre}</td>
//                                         <td>{calcularPromedioGeneral(asignatura.notasPorPeriodo)}</td>
//                                         <td style={{ backgroundColor: 'purple', color: 'white', textAlign: 'center' }}>{asignatura.notasPorPeriodo[periodos[0].id]?.[0]?.nota || '-'}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </Table>
//                     </div>
//                 </Col>
//             </Row>
//             <Row className="justify-content-center mb-4">
//                 <Col xs="auto">
//                     <StyledButton variant="purple" className="mx-2">
//                         Visualizar PDF Analítico Provisorio
//                     </StyledButton>
//                 </Col>
//                 <Col xs="auto">
//                     <StyledButton variant="purple" className="mx-2">
//                         Visualizar PDF DUE
//                     </StyledButton>
//                 </Col>
//             </Row>
//         </Container>
//     );
// };

// interface StyledButtonProps extends ButtonProps {
//     variant: 'purple';
// }

// const StyledButton = styled(Button)<StyledButtonProps>`
//     background-color: purple;
//     border-color: purple;
//     color: white;
//     margin-top: 1rem;
//     transition: transform 0.3s ease;

//     &:hover {
//       transform: scale(1.1);
//       background-color: white;
//       color: purple;
//       border-color: purple;
//     }
// `;

// export default ConsultaNota;
