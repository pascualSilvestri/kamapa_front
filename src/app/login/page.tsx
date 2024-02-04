"use client"
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, Button } from 'react-bootstrap';
import Image from 'next/image';


const LoginPage = () => {
  const [errors, setErrors] = useState<string[]>([]);
  const [dni, setDni] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors([]);

    const responseNextAuth = await signIn("credentials", {
      dni,
      password,
      redirect: false,
    });

    if (responseNextAuth?.error) {
      setErrors(responseNextAuth.error.split(","));
      return;
    }

    router.push("/dashboard");
  };

  return (
<div style={{ position: 'relative', width: '100%', height: '100vh' }}>
  <Image
    src="/backLogin.jpg"
    alt="Background"
    layout="fill"
    objectFit="cover"
  />
  <div className="d-flex justify-content-center align-items-center vh-100">
        <Card className="text-center">
        <Card.Header>
        < Image
          src="/Logo.png"
          alt="Logo"
          width={70}
          height={70}
          style={{ borderRadius: '50%' }}
        />
        </Card.Header>
        <Card.Body>
          <h2>Ingresar</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ingresa tu DNI"
              name="dni"
              className="form-control mb-2"
              value={dni}
              onChange={(event) => setDni(event.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              className="form-control mb-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />

            <style type='text/css'>
                    {`
                    .btn-flat {
                      background-color: purple;
                      color: white;
                    }

                    .btn-xxl {
                      padding: 0.4rem 1rem;
                      font-size: 1rem;
                    }
                  `}
                  </style>
            <Button type="submit" variant='flat' size='lg' className='btn-flat' >
              Ingresar
            </Button>
          </form>
          {errors.length > 0 && (
            <div className="alert alert-danger mt-2">
              <ul className="mb-0">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
    </div>
  );
};
export default LoginPage;
