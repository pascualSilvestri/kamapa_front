import { RoleEmun, AutorizedEmun } from './const';
import { Roles } from '../types/interfaces';


export function autorizeNivel(roles: Roles[]) {
    const rolePriority = [RoleEmun.Admin, RoleEmun.Director, RoleEmun.Secretario, RoleEmun.Preceptor, RoleEmun.Profesor, RoleEmun.Alumno];

    for (let role of rolePriority) {
        if (roles.find(rol => rol.name === role)) {
            switch (role) {
                case RoleEmun.Admin:
                    return AutorizedEmun.Admin;
                case RoleEmun.Director:
                    return AutorizedEmun.Director;
                case RoleEmun.Secretario:
                    return AutorizedEmun.Secretario;
                case RoleEmun.Preceptor:
                    return AutorizedEmun.Preceptor;
                case RoleEmun.Profesor:
                    return AutorizedEmun.Profesor;
                case RoleEmun.Alumno:
                    return AutorizedEmun.Alumno;
            }
        }
    }

    return -1;
}

export function autorizeRol(autorizeNivel: number) {
    switch (autorizeNivel) {
        case AutorizedEmun.Admin:
            return RoleEmun.Admin;
        case AutorizedEmun.Director:
            return RoleEmun.Director;
        case AutorizedEmun.Secretario:
            return RoleEmun.Secretario;
        case AutorizedEmun.Preceptor:
            return RoleEmun.Preceptor;;
        case AutorizedEmun.Profesor:
            return RoleEmun.Profesor;
        case AutorizedEmun.Alumno:
            return RoleEmun.Alumno;
        default:
            return -1;
    }
}


