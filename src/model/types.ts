export interface User {
	user?: UserSession; 
	id?: number | string;
	legajo?: string;
	fecha_ingreso?: string;
	fecha_egreso?: string | null;
	nombre?: string;
	apellido?: string;
	dni?: string;
	cuil?: string;
	fechaNacimiento?: string;
	telefono?: string;
	is_active?: boolean;
	create_for?: string;
	update_for?: string;
	password?: string;
	createdAt?: string;
	updatedAt?: string;
	domicilioId?: number;
	contactoId?: number;
	rolId?: number;
    first_session?: boolean;
	Roles?: Roles[];
	Instituciones ?: Institucion[];
	accessToken?: string; // Agrega esta línea
}


export interface UserSession{
    nombre: string;
	apellido: string;
	legajo: string;
	telefono: string;
}

export interface Roles {
    id: number;
    name: string;
}

export interface Session {
    user: User;
    expires: string;
    id: number;
    password: string;
    roles: Roles[];
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    legajo: string;
}

export interface Domicilio {
	id: number;
	calle: string;
	numero: string;
	localidad: string;
	provincia: string;
	pais: string;
}

export interface Provincia {
    id: string;
    provincia: string;
}


export interface Institucion {
    id: number;
    cue: string;
    nombre: string;
    logo: string;
    email?: string;
    contacto?: string;
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
    };
    rols: any[]
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

export interface Periodo {
    id: number;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    cicloId: number;
}

export interface CicloLectivo {
    id: number;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    isActive: boolean;
    Periodos: Periodo[]; // Cambiado a un array de objetos Periodo
}



export interface UserFormData {
    usuario: {
        legajo: string;
        matricula: string;
        fechaIngreso: string;
        fechaEgreso: null;
        nombre: string;
        apellido: string;
        dni: string;
        cuil: string;
        fechaNacimiento: string;
        telefono: string;
        email: string;
        is_active: boolean;
        create_for: string;
        update_for: string;
        password: string;
        institucion?: Institucion[];
        institucionId?: number;
    };
    rols: any[];
    domicilio: {
        calle: string;
        numero: string;
        barrio: string;
        localidad: string;
        provinciaId: string;
    }
}


export interface Curso {
    id: number;
    nombre: string;
    nominacion: string;
    division: string;
    institucionId?: string;
    asignaturas?: Asignatura[];
    cursosUsuario?: User[];
}


export interface Asignatura {
    id?: number;
    nombre?: string;
    curso?: Curso;
    usuarioAsignatura:User[];
}