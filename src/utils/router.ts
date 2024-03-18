import { Roles } from "../model/types"
import { RoleEmun } from "./const"
import path from 'path';


export const router = {
    'Inicio': { label : 'Inicio', href: '/' },
    'Dirección': { label : 'Dirección', href: '/director' },
    'Preceptores': { label : 'Preceptores', href: '/preceptor' },
    'Profesores': { label : 'Profesores', href: '/profesores' },
    'Alumnos': { label : 'Alumnos', href: '/alumnos' },
    'Aulas': { label : 'Aulas', href: '/aulas' },
    'About': { label : 'About', href: '/about' },
    'InstituciónRegistro': { label : 'Registrar Institucion', href: 'Admin/reginstitucion' },
    'InstituciónVista': { label : 'Vista Institucion', href: 'Admin/reginstitucion' },
    'AulasRegistro': { label : 'Aulas', href: '/regaulas' },
    'AlumnosRegistro': { label : 'Alumnos', href: '/regalumnos' },
    'Personal': { label : 'Registrar Empleado', href: '/regempleado' },
    'Permisos': { label : 'Permisos', href: '/permisos' },
    'Secretario':{ label: 'Secretario', href: '/secretario' },
    'Notas':  { label: 'Notas', href: '/calificar' },
    'Calificaciones':{ label: 'calificaciones', href: '/calificaciones' },
    'Empleados':{ label: 'Empleados', href: '/vistausuarios' },
}

export const adminAutorizeRouter = [
    'Inicio',
    'Dirección',
    'Preceptores',
    'Profesores',
    'Alumnos',
    'Empleados',
    'Aulas',
    'About',
    'InstituciónRegistro',
    'InstituciónVista',
    'AlumnosRegistro',
    'Personal',
    'Permisos',
    'AulasRegistro'
]

export const directorAutorizeRouter = [
    'Inicio',
    'Dirección',
    'Secretario',
    'Preceptores',
    'Profesores',
    'Alumnos',
    'Aulas',
    'About',
    'AlumnosRegistro',
    'Personal',
    'Permisos',
]

export const secretarioAutorizeRouter = [
    'Inicio',
    'Preceptores',
    'Profesores',
    'Aulas',
    'About',
    'Personal',
]

export const preceptorAutorizeRouter = [
    'Inicio',
    'Preceptores',
    'Alumnos',
    'Aulas',
    'About',
    'AlumnosRegistro',
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
    'Calificaciones'

]

export function getAuthorizedRoutes(router : {}, rolesAutorize: any) {
    const authorizedRoutes = [];
  
    for (const routeName in router) {
      if (rolesAutorize.includes(routeName)) {
        authorizedRoutes.push(router[routeName]);
      }
    }
  
    return authorizedRoutes;
  };
  


export function getRouterForRols(rol:string){
    switch (rol){
        case RoleEmun.Admin:
            return router;
        case RoleEmun.Director:
            return getAuthorizedRoutes(router,directorAutorizeRouter);
        case RoleEmun.Secretario:
            return getAuthorizedRoutes(router,secretarioAutorizeRouter);
        case RoleEmun.Preceptor:
            return getAuthorizedRoutes(router,preceptorAutorizeRouter);
        case RoleEmun.Profesor:
            return getAuthorizedRoutes(router,profesorAutorizeRouter);
        case RoleEmun.Alumno:
            return getAuthorizedRoutes(router,alumnoAutorizeRouter);
        default:
            return router;
    }
}

export function getRolesRouters(roles: Roles[]){
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
