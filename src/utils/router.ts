import { Roles } from "../model/types"
import { RoleEmun } from "./const"
import path from 'path';

export const router = {
    'Inicio': { label: 'Inicio', href: '/bienvenido' },
    'EditarAlumnos': { label: 'Editar Alumnos', href: '/editarAlumno', dropdown: 'Gestión Alumnos' },
    'RegistroAlumno': { label: 'Registro de Alumnos', href: '/consultaUsuario', dropdown: 'Gestión Alumnos' },
    'CursoAlumno': { label: 'Consultar Alumnos por Curso', href: '/curso_alumno', dropdown: 'Gestión Alumnos' },
    'consultaListaAlumnoPorcurso': { label: 'Consultar Lista de Alumnos por curso', href: '/alumnosPorCurso', dropdown: 'Gestión Alumnos' },
    'regAlumnoCurso': { label: 'Asignar Alumnos a los Cursos', href: '/regAlumnoCurso', dropdown: 'Gestión Alumnos' },
    'CrearCicloLectivo': { label: 'Crear Ciclo Lectivo', href: '/newciclolectivo', dropdown: 'Ciclo Lectivo' },
    'ModificarPeriodos': { label: 'Modificar Periodos', href: '/modificarPeriodos', dropdown: 'Ciclo Lectivo' },
    'AddAsignaturaCurso': { label: 'Agregar Asignatura a Cursos', href: '/addAsignaturaCurso', dropdown: 'Asignaturas' },
    'GestionAsignatura': { label: 'Gestion Asignatura', href: '/gestionAsignatura', dropdown: 'Asignaturas' },
    'consultaAsignaturaPorCurso': { label: 'Consultar Asignatura por curso', href: '/consultaAsignaturasCurso', dropdown: 'Asignaturas' },
    'Notas': { label: 'Notas', href: '/calificar', dropdown: 'Calificaciones' },
    'AddNotaAlumno': { label: 'Agregar nota al alumno', href: '/addNota', dropdown: 'Calificaciones' },
    'mesasExtraordinarias': { label: 'Mesas Extraordinarias', href: '/mesasExtraordinarias', dropdown: 'Calificaciones' },
    'Calificaciones': { label: 'Calificaciones', href: '/consultaNota', dropdown: 'Calificaciones' },
    'AulasRegistro': { label: 'Aulas', href: '/regaulas' },
    'RegistroUsuarios': { label: 'Registro de Usuarios', href: '/consultaUsuario' },
    'VistaUsuarios': { label: 'Usuarios', href: '/vistausuarios' },
    'resetearPasswordUsuario': { label: 'Resetear contraseña a usuario', href: '/resetPassword' },
    'AddAlumnoCurso': { label: 'Asignar cursos a alumnos', href: '/addAlumnoCurso' },
    'due': { label: 'Due', href: '/due' }
};


export const adminAutorizeRouter = [

]

export const directorAutorizeRouter = [
    'Inicio',
    'Alumno',
    'CicloLectivo',
    'Asignaturas',
    'AulasRegistro',
    'RegistroUsuarios',
    'VistaUsuarios',
    'resetearPasswordUsuario',
    'AddAlumnoCurso',
    'due'
]

export const secretarioAutorizeRouter = [
    'Inicio',

]

export const preceptorAutorizeRouter = [
    'Inicio',

]

export const profesorAutorizeRouter = [
    'Inicio',
    'Alumnos',
    'About',
    'Notas',
    'AddNotaAlumno',
    'mesasExtraordinarias'
]

export const alumnoAutorizeRouter = [
    'Inicio',
    'About',
    'Calificaciones',
    'due'

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
