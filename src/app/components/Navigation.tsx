'use client'
import { Nav, Navbar, NavDropdown, Container, Offcanvas } from 'react-bootstrap';
import { Roles, User } from '../../model/types';
import { autorizeNivel, autorizeRol, getRoles } from '../../utils/autorizacionPorRoles';
import Link from 'next/link';
import Image from 'next/image';
import ButtonAuth from './ButtonAuth';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getRolesRouters } from '../../utils/router';



export function Navigation() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rol, setRol] = useState<Roles[]>([]);
  const [userRoutes, setUserRoutes] = useState([]);
  const [user, setUser] = useState<User>({
    nombre: '',
    apellido: '',
    legajo: '',
    telefono: '',
    Roles: rol
  });


  useEffect(() => {
    // Si no hay sesión, redirige a la página de inicio de sesión
    if (!session) {
      router.push('/login');
    }

    if (session) {
      setUser({
        nombre: session.user.nombre,
        apellido: session.user.apellido,
        legajo: session.user.legajo,
        telefono: session.user.telefono,
        Roles: session.user.Roles
      });
      setRol(session.user.Roles);
      setUserRoutes(getRolesRouters(session.user.Roles));
    }
  }, [router, session]);



  return (
    <header data-bs-theme='dark'>
      {['xxxl'].map((expand) => (
        <Navbar
          key={expand} expand={expand} className='bg-body-tertiary mb-3'
        >
          <Container fluid>
            <Navbar.Brand href='#'>
              {/* Logo de KAMAPA */}
              <Image
                src='/Logo.png'
                alt='logo'
                width={50}
                height={50}
                className='d-inline-block align-top'
                style={{
                  borderRadius: '50%'
                }}
              />
              <h2 className='float-end m-lg-2'>KAMAPA</h2>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
            <Navbar.Offcanvas
              data-bs-theme='dark'
              id={`offcanvasNavbar-expand-${expand}`}
              aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
              placement='end'
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                  Esc. Sec. José Rudecindo Rojo
                </Offcanvas.Title>
              </Offcanvas.Header>
              <hr />
              <Offcanvas.Header className='justify-content-center'>
                {/* Logo de la Escuela, traer Link de la BD luego */}
                <Image
                  src='/LogoJRR.png'
                  alt='logo'
                  width={100}
                  height={100}
                  className='justify-content-center'
                  style={{ marginBottom: '10px' }}
                />
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className='justify-content-end flex-grow-1 pe-3'>
                  {userRoutes && userRoutes.map((route, index) => {
                    return (


                      <Link style={{
                        textDecoration: 'none',
                        color: 'white',
                        margin: '10px 0',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        backgroundColor: 'transparent',
                        border: '1px solid white '
                      }} href={`/dashboard/${route.href}`} key={index}>
                      {route.label}
                      </Link>

                    )
                  })}
                </Nav>
                <hr />
                {/* <Form className='d-flex'>
                  <Form.Control
                    type='search'
                    placeholder='Search'
                    className='me-2'
                    aria-label='Search'
                  /> */}

                <ButtonAuth />
                {/* </Form> */}
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ))}
    </header>
  );
}