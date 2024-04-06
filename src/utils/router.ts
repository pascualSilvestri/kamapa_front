import { Roles } from "../model/types"
import { RoleEmun } from "./const"
import path from 'path';


export const router = {
    'Inicio': { label : 'Inicio', href: '/' },
    'Dirección': { label : 'Dirección', href: '/director' },
    'Preceptores': { label : 'Preceptores', href: '/preceptor' },
    'Profesores': { label : 'Profesores', href: '/profesores' },
    'Alumnos': { label : 'Alumnos', href: '/alumnos' },
    'Empleados':{ label: 'Empleados', href: '/vistausuarios' },
    'Aulas': { label : 'Aulas', href: '/aulas' },
    'About': { label : 'About', href: '/about' },
    'CiclosLectivos': { label : 'Ciclos Lectivos', href: '/ciclolectivo' },
    'CrearCicloLectivo': { label : 'Crear Ciclo Lectivo', href: '/newciclolectivo' },
    'CrearAulas': { label : 'Crear Aulas', href: '/crearaulas' },
    'InstituciónRegistro': { label : 'Registrar Institucion', href: 'Admin/reginstitucion' },
    'InstituciónVista': { label : 'Vista Institucion', href: 'Admin/reginstitucion' },
    'AulasRegistro': { label : 'Aulas', href: '/regaulas' },
    'AlumnosRegistro': { label : 'Registro de Alumnos', href: '/regalumnos' },
    'PersonalRegistro': { label : 'Registrar de Empleado', href: '/regempleado' },
    'Permisos': { label : 'Permisos', href: '/permisos' },
    'Secretario':{ label: 'Secretario', href: '/secretario' },
    'Notas':  { label: 'Notas', href: '/calificar' },
    'Calificaciones':{ label: 'calificaciones', href: '/calificaciones' },
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
    'CrearCicloLectivo',
    'CrearAulas',
    'InstituciónRegistro',
    'InstituciónVista',
    'AlumnosRegistro',
    'PersonalRegistro',
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
    'Empleados',
    'CrearCicloLectivo',
    'CrearAulas',
    'Aulas',
    'About',
    'AlumnosRegistro',
    'PersonalRegistro',
    'Permisos',
]

export const secretarioAutorizeRouter = [
    'Inicio',
    'Preceptores',
    'Profesores',
    'Aulas',
    'About',
    'PersonalRegistro',
    'CrearCicloLectivo',
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
