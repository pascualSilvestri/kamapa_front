'use client'
import { Roles, User } from 'model/types';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const NewCicloLectivoPage = ({ params }: { params: { id: string } }) => {
  const [cicloLectivo, setCicloLectivo] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    institucionId:1,
    periodos: [],
  });

  console.log(`soy id ${params.id}`);

  const [nuevoPeriodo, setNuevoPeriodo] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const { data: session, status } = useSession();
	
	const [rol, setRol] = useState<Roles[]>([]);
	const [user, setUser] = useState<User>({
		nombre: '',
		apellido: '',
		legajo: '',
		telefono: '',
		Roles: rol,
		Instituciones:[]
	});


	useEffect(() => {

		if (session) {
			
			setUser({
				nombre: session.user.nombre,
				apellido: session.user.apellido,
				legajo: session.user.legajo,
				telefono: session.user.telefono,
				Roles: session.user.Roles,
				Instituciones: session.user.Instituciones

			});
			setRol(session.user.Roles);
		

		}
	}, [session]);


  const handleChangeCicloLectivo = (e) => {
    const { name, value } = e.target;
    setCicloLectivo({
      ...cicloLectivo,
      [name]: value,
    });
  };

  const handleChangePeriodo = (e, index) => {
    const { name, value } = e.target;
    const newPeriodos = [...cicloLectivo.periodos];
    newPeriodos[index] = {
      ...newPeriodos[index],
      [name]: value,
    };
    setCicloLectivo({
      ...cicloLectivo,
      periodos: newPeriodos,
    });
  };

  const handleAddPeriodo = () => {
    setCicloLectivo({
      ...cicloLectivo,
      periodos: [...cicloLectivo.periodos, nuevoPeriodo],
    });
    setNuevoPeriodo({
      nombre: '',
      fechaInicio: '',
      fechaFin: '',
    });
  };

  const handleRemovePeriodo = (index) => {
    const newPeriodos = cicloLectivo.periodos.filter((_, i) => i !== index);
    setCicloLectivo({
      ...cicloLectivo,
      periodos: newPeriodos,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cicloElectivo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cicloLectivo),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      alert('Ciclo lectivo creado exitosamente');
    } catch (error) {
      console.error('Error al crear ciclo lectivo:', error.message);
    }
  };
  
  return (
    <div className="container">
      <h2>Crear Nuevo Ciclo Lectivo</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre del ciclo lectivo:
          <input
            type="text"
            name="nombre"
            value={cicloLectivo.nombre}
            onChange={handleChangeCicloLectivo}
            required
          />
        </label>
        <br />
        <br />
        <label>
          Fecha de inicio:
          <input
            type="date"
            name="fechaInicio"
            value={cicloLectivo.fechaInicio}
            onChange={handleChangeCicloLectivo}
            required
          />
        </label>
        <br />
        <br />
        <label>
          Fecha de fin:
          <input
            type="date"
            name="fechaFin"
            value={cicloLectivo.fechaFin}
            onChange={handleChangeCicloLectivo}
            required
          />
        </label>
        <br />
        <hr />
        <h3>Agregar Periodos</h3>
        
        {cicloLectivo.periodos.map((periodo, index) => (
          <div key={index} style={{ border: '2px solid purple', padding: '10px', marginBottom: '20px' }}>
            <label>
              Nombre del periodo:
              <input
                type="text"
                name="nombre"
                value={periodo.nombre}
                onChange={(e) => handleChangePeriodo(e, index)}
                required
              />
            </label>
            <br />
            <br />
            <label>
              Fecha de inicio:
              <input
                type="date"
                name="fechaInicio"
                value={periodo.fechaInicio}
                onChange={(e) => handleChangePeriodo(e, index)}
                required
              />
            </label>
            <br />
            <br />
            <label>
              Fecha de fin:
              <input
                type="date"
                name="fechaFin"
                value={periodo.fechaFin}
                onChange={(e) => handleChangePeriodo(e, index)}
                required
              />
            </label>
            <br />
            <br />
            <button
              type="button"
              onClick={() => handleRemovePeriodo(index)}
              style={{
                backgroundColor: 'red',
                color: 'white',
                padding: '0.4rem 1rem',
                fontSize: '1rem',
                border: '2px solid red',
                cursor: 'pointer',
                }} 
                onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = 'red';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'red';
                    e.currentTarget.style.color = 'white';
                }}
            >
              Eliminar Periodo
            </button>
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={handleAddPeriodo}
            style={{
                backgroundColor: 'purple',
                color: 'white',
                padding: '0.4rem 1rem',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                marginBottom: '10px',
                border: '2px solid purple',
                cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = 'black';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'purple';
                e.currentTarget.style.color = 'white';
            }}
          >
            Agregar Periodo
          </button>
          <br />
          <button
            type="submit"
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
          >
            Crear Ciclo Lectivo
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCicloLectivoPage;
