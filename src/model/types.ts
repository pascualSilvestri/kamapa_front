export interface User {
	nombre: string;
	apellido: string;
	legajo: string;
	telefono: string;
	Roles?: Roles[];
}

export interface Roles {
    name: string;
	id: number;
}

export interface Session {
	user: User;
	expires: string;
	id: number;
	password: string;
	roles: Roles;
	nombre: string;
	apellido: string;
	dni: string;
	telefono: string;
	legajo: string;
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
