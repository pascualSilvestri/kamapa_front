import { Roles } from "../model/types"
import { RoleEmun } from "./const"
import path from 'path';


export const router = {
    'Inicio': { label: 'Inicio', href: `/bienvenido` },
    'Dirección': { label: 'Dirección', href: '/director' },
    'Preceptores': { label: 'Preceptores', href: '/preceptor' },
    'Profesores': { label: 'Profesores', href: '/profesores' },
    'Alumnos': { label: 'Alumnos', href: '/alumnos' },
    'About': { label: 'About', href: '/about' },
    'CiclosLectivos': { label: 'Ciclos Lectivos', href: '/ciclolectivo' },
    'CrearCicloLectivo': { label: 'Crear Ciclo Lectivo', href: '/newciclolectivo' },
    'Curso': { label: 'Gestion Curso y Asigantura', href: '/Curso' },
    'CursoAlumno': { label: 'Consultar Alumnos por Curso', href: '/curso_alumno' },
    'AulasRegistro': { label: 'Aulas', href: '/regaulas' },
    'RegistroUsuarios': { label: 'Registro de Usuarios', href: '/consultaUsuario' },
    'Permisos': { label: 'Permisos', href: '/permisos' },
    'Secretario': { label: 'Secretario', href: '/secretario' },
    'Notas': { label: 'Notas', href: '/calificar' },
    'Calificaciones': { label: 'calificaciones', href: '/calificaciones' },
    'VistaUsuarios': { label: 'Usuarios', href: '/vistausuarios' },
    'resetearPasswordUsuario': { label: 'Resetear contraseña a usuario', href: '/resetPassword' },
}

export const adminAutorizeRouter = [

]

export const directorAutorizeRouter = [
    'Inicio',
    // 'Dirección',
    // 'Secretario',
    // 'Preceptores',
    // 'Profesores',
    // 'Alumnos',
    'CrearCicloLectivo',
    'Curso',
    'CursoAlumno',
    // 'CrearAulas',
    // 'Aulas',
    // 'About',
    'RegistroUsuarios',
    // 'Permisos',
    'VistaUsuarios',
    'resetearPasswordUsuario'
]

export const secretarioAutorizeRouter = [
    'Inicio',
    'Preceptores',
    'Profesores',
    'Aulas',
    'About',
    'RegistroUsuarios',
    'CrearCicloLectivo',
    'Curso',
    'CursoAlumno',
    'VistaUsuarios'
]

export const preceptorAutorizeRouter = [
    'Inicio',
    'Preceptores',
    'CursoAlumno',
    'Alumnos',
    'Aulas',
    'About',
]

export const profesorAutorizeRouter = [
    'Inicio',
    'Alumnos',
    'Aulas',
    'About',
    'Notas',

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
