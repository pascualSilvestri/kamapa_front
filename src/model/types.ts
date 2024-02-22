export interface User {
	nombre: string;
	apellido: string;
	legajo: string;
	telefono: string;
	rol?: string;
}

export interface Rol {
	name: string;
	id: number;
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
