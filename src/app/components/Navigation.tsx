// Navigation.js
'use client'
import { Nav, Navbar, NavDropdown, Container, Offcanvas } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import ButtonAuth from './ButtonAuth';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getRolesRouters } from '../../utils/router';
import { useInstitucionSelectedContext, useRolesContext, useUserContext } from 'context/userContext';

export function Navigation() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rol, setRol] = useRolesContext();
  const [userRoutes, setUserRoutes] = useState([]);
  const [user, setUser] = useUserContext();
  const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();

  console.log(rol)

  useEffect(() => {
    // Si no hay sesión, redirige a la página de inicio de sesión
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  useEffect(() => {
    setUserRoutes(getRolesRouters(rol));
  }, [rol]);

  return (
    <header data-bs-theme='dark'>
      {['xxxl'].map((expand) => (
        <Navbar
          key={expand} expand={expand} className='bg-body-tertiary mb-3'
        >
          <Container fluid className='d-flex justify-content-between'>
            <Navbar.Brand href='#' className='d-flex align-items-end'>
              {/* Logo de KAMAPA */}
              <Image
                src={institucionSelected.logo || '/Logo.png'}
                alt='logo'
                width={50}
                height={50}
                className='d-inline-block align-top'
                style={{
                  borderRadius: '50%'
                }}
              />
              <h2 className='ms-2 mb-0'>{institucionSelected.nombre}</h2>
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
                  {institucionSelected.nombre}
                </Offcanvas.Title>
              </Offcanvas.Header>
              <hr />
              <Offcanvas.Header className='justify-content-center'>
                {/* Logo de la Escuela, traer Link de la BD luego */}
                <Image
                  src={institucionSelected.logo || '/Logo.png'}
                  alt='logo'
                  width={100}
                  height={100}
                  className='justify-content-center'
                  style={{ marginBottom: '10px' }}
                />
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className='justify-content-center flex-grow-1 pe-3'>
                  <Link href='/dashboard' className='nav-link btn btn-outline-light m-2'>
                    Seleccionar Escuela
                  </Link>
                  {userRoutes && userRoutes.map((route, index) => (
                    <Link
                      key={index}
                      href={route.href.includes("Admin") ? `/dashboard/${route.href}` : `/dashboard/${institucionSelected.id}/${route.href}`}
                      className='nav-link btn btn-outline-light m-2'
                    >
                      {route.label}
                    </Link>
                  ))}
                </Nav>
                <hr />
                <div className='d-flex justify-content-center'>
                  <ButtonAuth />
                </div>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ))}
    </header>
  );
}
