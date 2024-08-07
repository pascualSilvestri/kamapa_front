import { Roles } from "../model/types"
import { RoleEmun } from "./const"
import path from 'path';

export const router = {
    'Inicio': { label: 'Inicio', href: '/bienvenido' },
    // Direccion y Administracion
    'resetearPasswordUsuario': { label: 'Resetear contraseña a usuario', href: '/resetPassword', dropdown: 'Dirección y Administracion' },
    'RegistrarUsuarios': { label: 'Registrar Usuarios', href: '/consultaUsuario', dropdown: 'Dirección y Administracion' },
    'VistaUsuarios': { label: 'Personal Docente y Administrativo', href: '/vistausuarios', dropdown: 'Dirección y Administracion' },
    // Gestion Alumnos
    'EditarAlumnos': { label: 'Alumnos', href: '/editarAlumno', dropdown: 'Gestión Alumnos' },
    'RegistroAlumno': { label: 'Registro de Alumnos', href: '/consultaUsuario', dropdown: 'Gestión Alumnos' },
    'CursoAlumno': { label: 'Consultar Alumnos por Curso', href: '/curso_alumno', dropdown: 'Gestión Alumnos' },
    // 'regAlumnoCurso': { label: 'No se sabe que es?', href: '/alumnosPorCurso', dropdown: 'Gestión Alumnos' },
    'MoverAlumnoPorcurso': { label: 'Mover Alumnos de Curso', href: '/regAlumnoCurso', dropdown: 'Gestión Alumnos' },
    'AddAlumnoCurso': { label: 'Asignar Alumno a los Cursos', href: '/addAlumnoCurso', dropdown: 'Gestión Alumnos' },
    // Ciclo Lectivo y Periodos
    'CrearCicloLectivo': { label: 'Crear Ciclo Lectivo', href: '/newciclolectivo', dropdown: 'Ciclo Lectivo' },
    'ModificarPeriodos': { label: 'Modificar Periodos', href: '/modificarPeriodos', dropdown: 'Ciclo Lectivo' },
    // Asignaturas
    'GestionAsignatura': { label: 'Gestionar Asignaturas', href: '/gestionAsignatura', dropdown: 'Asignaturas y Cursos' },
    'GestionCurso': { label: 'Gestionar Cursos', href: '/gestionCurso', dropdown: 'Asignaturas y Cursos' },
    'AddAsignaturaCurso': { label: 'Asociar Docentes y Materias a los Cursos', href: '/addAsignaturaCurso', dropdown: 'Asignaturas y Cursos' },
    'consultaAsignaturaPorCurso': { label: 'Consultar Asignatura por curso', href: '/consultaAsignaturasCurso', dropdown: 'Asignaturas y Cursos' },




    // Calificaciones
    'AddNotaAlumno': { label: 'Calificar al alumno', href: '/addNota', dropdown: 'Calificaciones' },
    'mesasExtraordinarias': { label: 'Mesas Extraordinarias', href: '/mesasExtraordinarias', dropdown: 'Calificaciones' },
    'Calificaciones': { label: 'Calificaciones', href: '/consultaNota', dropdown: 'Calificaciones' },
    'due': { label: 'D.U.E.', href: '/due', dropdown: 'Calificaciones' },
    'reporteReprobados': { label: 'Reporte de reprobados', href: '/reporteDeReprobados', dropdown: 'Reportes' },
    'modifyNota': { label: 'Modificar Nota', href: '/modifyNota', dropdown: 'Calificaciones' },
    //Gestión Reportes
    'ReporteDUE': { label: 'Reporte D.U.E', href: '/reporteDue', dropdown: 'Reportes' },

};


export const adminAutorizeRouter = [

]

export const directorAutorizeRouter = [
    'Inicio',
    'EditarAlumnos',
    'RegistroAlumno',
    'CursoAlumno',
    'AddAlumnoCurso',
    'MoverAlumnoPorcurso',
    'CrearCicloLectivo',
    'ModificarPeriodos',
    'GestionAsignatura',
    'GestionCurso',
    'AddAsignaturaCurso',
    'RegistrarUsuarios',
    'VistaUsuarios',
    'modifyNota',
    'reporteReprobados',
    'ReporteDUE'

]

export const secretarioAutorizeRouter = [
    'Inicio',
    'RegistroAlumno',
    'CursoAlumno',
    'AddAlumnoCurso',
    'MoverAlumnoPorcurso',
    'CrearCicloLectivo',
    'GestionAsignatura',
    'GestionCurso',
    'ModificarPeriodos',
    'AddAsignaturaCurso',
    'consultaAsignaturaPorCurso',
    'RegistrarUsuarios',
    'VistaUsuarios',
    'ReporteDUE'

]

export const preceptorAutorizeRouter = [
    'Inicio',
    'CursoAlumno',
    'AddAlumnoCurso',
    'RegistroAlumno',
    'consultaAsignaturaPorCurso',

]

export const profesorAutorizeRouter = [
    'Inicio',
    'Alumnos',
    'About',
    'Notas',
    'AddNotaAlumno',
    'mesasExtraordinarias',
    'AddNotaAlumno'
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
