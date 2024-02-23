interface User {
	user: UserSession; 
	id: number;
	legajo: string;
	fecha_ingreso: string;
	fecha_egreso: string | null;
	nombre: string;
	apellido: string;
	dni: string;
	cuil: string;
	fechaNacimiento: string;
	telefono: string;
	is_active: boolean;
	create_for: string;
	update_for: string;
	password: string;
	createdAt: string;
	updatedAt: string;
	domicilioId: number;
	contactoId: number;
	rolId: number;
	rol: Rol;
}

interface UserSession{
    nombre: string;
	apellido: string;
	legajo: string;
	telefono: string;
}

interface Rol {
	id: number;
	name: string;
}


interface Institucion {
	id: number;
	cue: string;
	nombre: string;
	logo: string;
}

interface Domicilio {
	id: number;
	calle: string;
	numero: string;
	localidad: string;
	provincia: string;
	pais: string;
}

interface Contacto {
	id: number;
	email: string;
	telefono: string;
}

export type { User, Rol, Institucion, Domicilio, Contacto };