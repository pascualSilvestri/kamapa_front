


enum environment {
    dev = 'http://localhost:3001/',
    prov = `production`,
}


export class Environment {


    private static environment: environment = environment.dev;

    private static getEnvironment(env: environment): string {
        if (env == environment.prov) {
            return 'https://kamapabackend-production.up.railway.app/';
        } else {
            return environment.dev;
        }
    }


    public static endPoint = {
        login: 'api/auth/login/',
        provincias: 'api/provincia/',
        roles: 'api/rols/',
        institucion: 'api/institucion/',
        getInstitucionById: 'api/institucion/',
        /*
        traer institucion por el id
        url/api/institucion/id
       */
        getInstitucionForRolsForUser: 'api/institucion/userRolsInstitucion/',
        /*
        url/api/institucion/userRolsInstitucion/idInstitucion
        {
            "usuarioId":1
        }
         */
        usuario: 'api/usuario/',
        /*
        Traer a todos los usuarios
            url/api/usuario
        */
        getUsuariosAllByIntitucion: 'api/usuario/institucion/',
        /*
        Traer a todos los usuarios
            url/api/usuario/institucion/idInstitucion
        */
        getUsuarioWhereRolIsAlumno: 'api/usuario/alumnos/',
        //url/api/usuario/alumnos
        getUsuarioWhereRolIsNotAlumno: 'api/usuario/empleados/',
        //url/api/usuario/empleados
        getUsuarioWhereRolIsAlumnoByInstitucion: 'api/usuario/alumno/',
        /**
         * @param {string} idInstitucion
         */
        //url/api/usuario/alumnos/idInstitucion
        getUsuarioWhereRolIsNotAlumnoByIntitucion: 'api/usuario/empleados/',
        //url/api/usuario/empleados/idInstitucion
        getUsuarioWhereRolIsNotAlumnoByIntitucionByUsuario: 'api/usuario/empleado/',
        getUsuarioByDni: 'api/usuario/searchUsuarioById/',
        //url/api/usuario/empleado
        /*
        traer usuarion con rol que no sea alumno por el id de la institucion y id del usuario
        {
            "idInstitucion":1,
            "idUsuario":1
        }
        */
        updateUsuarioById: 'api/usuario/update/',

        /** 
         * 
            {
        "usuario": {
        "legajo": "123ABC",
        "nombre": "Pascual",
        "apellido": "silvestri",
        "roles": [
            "1",
            "2",
            "6"
            ]
            }
        }
         */


        getUsuarioWhereRolIsAlumnoByIntitucionByUsuario: 'api/usuario/alumno/',
        //url/api/usuario/alumno
        /*
        {
            "idInstitucion":1,
            "idUsuario":1
        }
        */
        addInstitucion: 'api/usuario/addInstitucion/',
        /*
            {
                "usuarioId":4,
                "institucionId":3,
                "roles":[1,3,4]
            }
        */
        changePasswordFirst: 'api/password/changePassword/',
        /** 
         * Cambio de contraseña por primera vez
        {
            userId:1,
            password:'123'
        }
        */
        resetPassword: 'api/password/resetPassword/',
        /**
         * resetear la contraseña del usuario
        {
            dni:99777333
        }
        */
        getCicloLectivo: 'api/cicloElectivo/ciclo/',
        /**
         * Obtener ciclo eletivo actual por id de la institucion
         * @param {int} id
            api/cicloElectivo/ciclo/id
        */
        createCicloLectivo: 'api/cicloElectivo/',
        /**
         * Crear nuevo ciclo lectivo y sus periodos
         * @body {
                    "nombre": "2025",
                    "fechaInicio": "2025-04-06",
                    "fechaFin": "2025-04-30",
                    "institucionId": 1,
                    "periodos": [
                        {
                            "nombre": "periodo 1",
                            "fechaInicio": "2025-04-06",
                            "fechaFin": "2025-04-20"
                        },
                        {
                            "nombre": "periodo 2",
                            "fechaInicio": "2025-04-20",
                            "fechaFin": "2025-04-30"
                        },
                        {
                            "nombre": "periodo 3",
                            "fechaInicio": "2025-04-20",
                            "fechaFin": "2025-04-30"
                        }
                    ]
                }
         */
        getAllCicloLectivo: 'api/cicloElectivo/ciclos/',
        /**
         * Trae todos los ciclos lectivos de la institucion seleccionada
         * @param {int} idInstitucion
            api/cicloElectivo/ciclo/idInstitucion
        */

        getCursosByInstitucion: 'api/cursos/institucion/',
        /**
         * Trae todos los cursos de la institucion seleccionada
         * @param {int} idInstitucion
            api/cursos/institucion/idInstitucion
        */
        getAsignaturaByInstitucion: 'api/asignatura/institucion/',
        /**
         * Trae todas las asignaturas de la institucion seleccionada
         * @param {int} idInstitucion
            api/asignatura/institucion/idInstitucion
        */
        createCurso: 'api/cursos/',
        /**
         * Crear nuevo curso
         * @body {
            "nombre": "Curso 1",
            "nominacion": 1,
            "division": 1,
            "institucionId": 1
            }
        */
        crearAsignatura: 'api/asignatura/',
        /**
         * Crear nueva asignatura
         * @body {
            "nombre": "Asignatura 1",
            "institucionId": 1
            }
         */
        deleteCurso: 'api/cursos/delete/',
        /**
         * Eliminar curso
         * @param {int} cursoId
         */
        deleteAsignatura: 'api/asignatura/delete/',
        /**
         * Eliminar asignatura
         * @param {int} asignaturaId
         */
        updateAsignatura: 'api/asignatura/update/',
        /**
         * Actualizar asignatura
         * @param {int} asignaturaId
         * @body {
            "nombre": "Asignatura 1",
            "institucionId": 1
        */
        updateCursor: 'api/cursos/update/',
        /**
         * Actualizar curso
         * @param {int} cursoId
         * @body {
            "nombre": "Curso 1",
            "nominacion": 1,
            "division": 1,
            "institucionId": 1
        */

    }

    public static getEndPoint(endPoint: string): string {
        return `${this.getEnvironment(this.environment)}${endPoint}`;
    }




}