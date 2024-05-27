"use client";

import { useEffect, useState } from "react";
import "./ChangePasswordPage.css"; // Importa el archivo CSS
import { useUserContext } from "context/userContext";
import { useRouter } from "next/navigation";
import { Environment } from "utils/EnviromenManager";
import { useSession } from "next-auth/react";

function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [user, setUser] = useUserContext();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [router, session]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword === confirmNewPassword) {
      const response = await fetch(
        `${Environment.getEndPoint(Environment.endPoint.changePasswordFirst)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session.user.id,
            password: newPassword,
          }),
        }
      );
      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      if(response.status === 200){
        alert("Contraseña cambiada con éxito");
      router.push("/login");
      
      }

      
    } else {
      alert("Las contraseñas no coinciden");
      return;
    }
    console.log(session.user);
  };

  return (
    <div className="change-password-container">
      <h1>Cambiar Contraseña</h1>
      <form className="change-password-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="new-password">Nueva Contraseña</label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-new-password">
            Confirmar Nueva Contraseña
          </label>
          <input
            type="password"
            id="confirm-new-password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        </div>
        <button className="submit-button" type="submit"           
        style={{
                                            backgroundColor: 'purple',
                                            color: 'white',
                                            padding: '0.4rem 1rem',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.color = 'black';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'purple';
                                            e.currentTarget.style.color = 'white';
                                        }}>
          Cambiar Contraseña
        </button>
      </form>
    </div>
  );
}

export default ChangePasswordPage;
