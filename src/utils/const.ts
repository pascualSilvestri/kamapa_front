import { Roles } from "../model/types"

export enum ModalType {
    View = 'view',
    Edit = 'edit',
    Delete = 'delete',
}

export enum RoleEmun {
    Director = 'Director',
    Preceptor = 'Preceptor',
    Profesor = 'Profesor',
    Secretario = 'Secretario',
    Alumno = 'Alumno',
    Admin = 'Admin',
}

export enum AutorizedEmun {
    Director = 1,
    Secretario = 2,
    Preceptor = 3,
    Profesor = 4,
    Alumno = 5,
    Admin = 0,
}
