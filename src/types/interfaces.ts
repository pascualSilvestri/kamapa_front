export interface User {
	user: UserSession; 
	id: number | string;
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
	accessToken: string; // Agrega esta línea
}

export interface UserSession{
    nombre: string;
	apellido: string;
	legajo: string;
	telefono: string;
}

export interface Rol {
	id: number;
	name: string;
}


export interface Institucion {
	id: number;
	cue: string;
	nombre: string;
	logo: string;
}

export interface Domicilio {
	id: number;
	calle: string;
	numero: string;
	localidad: string;
	provincia: string;
	pais: string;
}

export interface Contacto {
	id: number;
	email: string;
	telefono: string;
}

export interface EmployeeFormData {
    empleado: {
        matricula: string;
        isActive: null;
    };
    usuario: {
        legajo: string;
        fecha_ingreso: string;
        fecha_egreso: null;
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
        rolId: string;
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