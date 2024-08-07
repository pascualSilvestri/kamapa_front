'use client';
import { Nav, Navbar, NavDropdown, Container, Offcanvas } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import ButtonAuth from './ButtonAuth';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useInstitucionSelectedContext, useRolesContext, useUserContext } from 'context/userContext';

export function NavigationAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();

  useEffect(() => {
    // Si no hay sesión, redirige a la página de inicio de sesión
    if (status !== 'loading' && !session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <p>Loading...</p>; // O cualquier componente de carga que prefieras
  }

  return (
    <header data-bs-theme='dark'>
      {['xxxl'].map((expand) => (
        <Navbar
          key={expand} expand={expand} className='bg-body-tertiary mb-3'
        >
          <Container >
            <Navbar.Brand href=''>
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
              <h2 className='float-end m-lg-2'>Panel Admin</h2>
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
                  {session && session.user ? (
                    <>
                      Bienvenido {session.user.nombre} {session.user.apellido}
                    </>
                  ) : (
                    'Bienvenido'
                  )}
                </Offcanvas.Title>
              </Offcanvas.Header>
              <hr />
              <Offcanvas.Header className='justify-content-center'>
                {/* Logo de la Escuela, traer Link de la BD luego */}
                <Image
                  src='/Logo.png'
                  alt='logo'
                  width={100}
                  height={100}
                  className='justify-content-center'
                  style={{ marginBottom: '10px' }}
                />
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className='justify-content-end flex-grow-1 pe-3'>
                  <Link style={{
                    textDecoration: 'none',
                    color: 'white',
                    margin: '10px 0',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    backgroundColor: 'transparent',
                    border: '1px solid white'
                  }} href='/dashboard'>
                    Seleccionar Escuela
                  </Link>
                  <Link style={{
                    textDecoration: 'none',
                    color: 'white',
                    margin: '10px 0',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    backgroundColor: 'transparent',
                    border: '1px solid white'
                  }} href='/dashboard/Admin/reginstitucion'>
                    Registrar una institucion
                  </Link>
                  <Link style={{
                    textDecoration: 'none',
                    color: 'white',
                    margin: '10px 0',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    backgroundColor: 'transparent',
                    border: '1px solid white'
                  }} href='/dashboard/Admin/vistainstitucion'>
                    Instituciones
                  </Link>
                  <Link style={{
                    textDecoration: 'none',
                    color: 'white',
                    margin: '10px 0',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    backgroundColor: 'transparent',
                    border: '1px solid white'
                  }} href='/dashboard/Admin/regAdminUsuario'>
                    Registrar usuario
                  </Link>
                  <Link style={{
                    textDecoration: 'none',
                    color: 'white',
                    margin: '10px 0',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    backgroundColor: 'transparent',
                    border: '1px solid white'
                  }} href='/dashboard/Admin/consultaUsuario'>
                    Consulta Usuario
                  </Link>
                </Nav>
                <hr />
                <ButtonAuth />
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ))}
    </header>
  );
}
