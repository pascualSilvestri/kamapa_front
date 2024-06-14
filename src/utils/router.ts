import { Roles } from "../model/types"
import { RoleEmun } from "./const"
import path from 'path';


export const router = {
    'Inicio': { label: 'Inicio', href: `/bienvenido` },
    'EditarAlumnos': { label: 'Editar Alumnos', href: '/editarAlumno' },
    'CiclosLectivos': { label: 'Ciclos Lectivos', href: '/ciclolectivo' },
    'CrearCicloLectivo': { label: 'Crear Ciclo Lectivo', href: '/newciclolectivo' },
    'ModificarPeriodos': { label: 'Modificar Periodos', href: '/modificarPeriodos' },
    'GestionCurso': { label: 'Gestion Cursos', href: '/gestionCurso' },
    'AddAsignaturaCurso': { label: 'Agregar Asignatura a  Cursos ', href: '/addAsignaturaCurso' },
    'GestionAsignatura': { label: 'Gestion Asignatura ', href: '/gestionAsignatura' },
    'CursoAlumno': { label: 'Consultar Alumnos por Curso', href: '/curso_alumno' },
    'AulasRegistro': { label: 'Aulas', href: '/regaulas' },
    'RegistroUsuarios': { label: 'Registro de Usuarios', href: '/consultaUsuario' },
    'RegistroAlumno': { label: 'Registro de Alumnos', href: '/consultaUsuario' },
    'Notas': { label: 'Notas', href: '/calificar' },
    'Calificaciones': { label: 'Calificaciones', href: '/consultaNota' },
    'VistaUsuarios': { label: 'Usuarios', href: '/vistausuarios' },
    'resetearPasswordUsuario': { label: 'Resetear contraseña a usuario', href: '/resetPassword' },
    'AddAlumnoCurso': { label: 'Asignar cursos a alumnos', href: '/addAlumnoCurso' },
    'AddNotaAlumno': { label: 'Agregar nota al alumno', href: '/addNota' },

}

export const adminAutorizeRouter = [

]

export const directorAutorizeRouter = [
    'Inicio',
    'CrearCicloLectivo',
    'ModificarPeriodos',
    'GestionCurso',
    'GestionAsignatura',
    'AddAsignaturaCurso',
    'AddAlumnoCurso',
    'CursoAlumno',
    'EditarAlumnos',
    'RegistroUsuarios',
    'RegistroAlumno',
    'VistaUsuarios',
    'resetearPasswordUsuario',


]

export const secretarioAutorizeRouter = [
    'Inicio',
    'RegistroUsuarios',
    'CrearCicloLectivo',
    'GestionCurso',
    'AddAsignaturaCurso',
    'CursoAlumno',
    'VistaUsuarios',
    'GestionAsignatura'
]

export const preceptorAutorizeRouter = [
    'Inicio',
    'Preceptores',
    'CursoAlumno',
    'EditarAlumnos',
    'Alumnos',
    'Aulas',
    'About',
    'RegistroAlumno',
]

export const profesorAutorizeRouter = [
    'Inicio',
    'Alumnos',
    'Aulas',
    'About',
    'Notas',
    "AddNotaAlumno"

]

export const alumnoAutorizeRouter = [
    'Inicio',
    'Aulas',
    'About',
    'Calificaciones',

]

export function getAuthorizedRoutes(router: {}, rolesAutorize: any) {
    const authorizedRoutes = [];

    for (const routeName in router) {
        if (rolesAutorize.includes(routeName)) {
            authorizedRoutes.push(router[routeName]);
        }
    }

    return authorizedRoutes;
};



export function getRouterForRols(rol: string) {
    switch (rol) {
        case RoleEmun.Admin:
            return router
        // return getAuthorizedRoutes(router, adminAutorizeRouter);
        case RoleEmun.Director:
            return getAuthorizedRoutes(router, directorAutorizeRouter);
        case RoleEmun.Secretario:
            return getAuthorizedRoutes(router, secretarioAutorizeRouter);
        case RoleEmun.Preceptor:
            return getAuthorizedRoutes(router, preceptorAutorizeRouter);
        case RoleEmun.Profesor:
            return getAuthorizedRoutes(router, profesorAutorizeRouter);
        case RoleEmun.Alumno:
            return getAuthorizedRoutes(router, alumnoAutorizeRouter);
        default:
            return router;
    }
}

export function getRolesRouters(roles: Roles[]) {
    let routes = [];

    for (let role of roles) {
        let roleRoutes = getRouterForRols(role.name);
        if (Array.isArray(roleRoutes)) {
            routes = routes.concat(roleRoutes);
        } else {
            for (let key in roleRoutes) {
                routes.push(roleRoutes[key]);
            }
        }
    }

    return Array.from(new Set(routes));
}
