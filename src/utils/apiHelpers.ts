


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
        getUsuarioWhereRolIsAlumnoByInstitucion: 'api/usuario/alumnos/',
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

    }

    public static getEndPoint(endPoint: string): string {
        return `${this.getEnvironment(this.environment)}${endPoint}`;
    }




}