


enum environment {
    dev = 'http://localhost:3001/',
    prov = `production`,
}


export class Environment {


    private static environment: environment = environment.prov;

    private static getEnvironment(env: environment): string {
        if (env == environment.prov) {
            return process.env.NEXT_PUBLIC_BACKEND_URL;
        } else {
            return environment.dev;
        }
    }


    public static endPoint = {
        login:'api/auth/login',
        provincias:'api/provincia',
        roles:'api/rols',
        getInstitucionById: 'api/institucion/',
        /*
        traer institucion por el id
        url/api/institucion/id
        */
        usuario: 'api/usuario',
        /*
        Traer a todos los usuarios
          url/api/usuario
        */
        getUsuariosAllByIntitucion: 'api/usuario/institucion/',
        /*
        Traer a todos los usuarios
          url/api/usuario/institucion/idInstitucion
        */
        getUsuarioWhereRolIsAlumno: 'api/usuario/alumnos',
        //url/api/usuario/alumnos
        getUsuarioWhereRolIsNotAlumno: 'api/usuario/empleados',
        //url/api/usuario/empleados
        getUsuarioWhereRolIsAlumnoByInstitucion: 'api/usuario/alumnos/',
        //url/api/usuario/alumnos/idInstitucion
        getUsuarioWhereRolIsNotAlumnoByIntitucion: 'api/usuario/empleados/',
        //url/api/usuario/empleados/idInstitucion
        getUsuarioWhereRolIsNotAlumnoByIntitucionByUsuario: 'api/usuario/empleado',
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

    
        getUsuarioWhereRolIsAlumnoByIntitucionByUsuario: 'api/usuario/alumno'
        //url/api/usuario/alumno
        /*
            {
                "idInstitucion":1,
                "idUsuario":1
            }
        */
    }

    public static getEndPoint(endPoint: string): string {
        return `${this.getEnvironment(this.environment)}${endPoint}`;
    }




}