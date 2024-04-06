'use client'
import { User } from 'model/types';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Roles } from 'types/interfaces';

const CrearAulasPage = () => {
  const [aula, setAula] = useState({
    nombre: '',
    nivel: '',
    division: '',
    materias: [],
  });

  const [nuevaMateria, setNuevaMateria] = useState('');
  const [rol, setRol] = useState<Roles[]>([]);
  const [user, setUser] = useState<User>({
		nombre: '',
		apellido: '',
		legajo: '',
		telefono: '',
		Roles: rol,
		Instituciones:[]
	});

  const { data: session, status } = useSession();

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

  const handleChangeAula = (e) => {
    const { name, value } = e.target;
    setAula({
      ...aula,
      [name]: value,
    });
  };

  const handleChangeMateria = (e) => {
    setNuevaMateria(e.target.value);
  };

  const handleAddMateria = () => {
    if (nuevaMateria.trim() !== '') {
      setAula({
        ...aula,
        materias: [...aula.materias, nuevaMateria.trim()],
      });
      setNuevaMateria('');
    }
  };

  const handleRemoveMateria = (index) => {
    const nuevasMaterias = [...aula.materias];
    nuevasMaterias.splice(index, 1);
    setAula({
      ...aula,
      materias: nuevasMaterias,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //Aqui Hermano hacete el POST con el endpoint que corresponda
    console.log(aula);
  };

  console.log(user)

  return (
    <div className="container">
      <h2>Crear Aula</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre del Aula:
          <input
            type="text"
            name="nombre"
            value={aula.nombre}
            onChange={handleChangeAula}
            required
          />
        </label>
        <br />
        <br />
        <label>
          Nivel:
          <input
            type="number"
            name="nivel"
            value={aula.nivel}
            onChange={handleChangeAula}
            required
          />
        </label>
        <br />
        <br />
        <label>
          División:
          <input
            type="text"
            name="division"
            value={aula.division}
            onChange={handleChangeAula}
            required
          />
        </label>
        <br />
        <hr />
        <h3>Agregar Materias</h3>
        {aula.materias.map((materia, index) => (
          <div key={index} style={{ border: '2px solid purple', padding: '10px', marginBottom: '20px' }}>
            <span>{materia}</span>
            <button
              type="button"
              onClick={() => handleRemoveMateria(index)}
              style={{
                backgroundColor: 'red',
                color: 'white',
                padding: '0.4rem 1rem',
                fontSize: '1rem',
                border: '2px solid red',
                cursor: 'pointer',
                marginLeft: '10px',
              }}
            >
              Eliminar Materia
            </button>
          </div>
        ))}
        <label>
          Nueva Materia:
          <input
            type="text"
            value={nuevaMateria}
            onChange={handleChangeMateria}
          />
        </label>
        <br />
        <br />
        <button
          type="button"
          onClick={handleAddMateria}
          style={{
            backgroundColor: 'purple',
            color: 'white',
            padding: '0.4rem 1rem',
            fontSize: '1rem',
            marginBottom: '10px',
            border: '2px solid purple',
            cursor: 'pointer',
          }}
        >
          Agregar Materia
        </button>
        <br />
        <button
          type="submit"
          style={{
            backgroundColor: 'purple',
            color: 'white',
            padding: '0.4rem 1rem',
            fontSize: '1rem',
            border: '2px solid purple',
            cursor: 'pointer',
          }}
        >
          Crear Aula
        </button>
      </form>
    </div>
  );
};

export default CrearAulasPage;
