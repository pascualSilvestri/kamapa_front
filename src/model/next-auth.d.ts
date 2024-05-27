// import "next-auth";
import { User, Rol } from "./interfaces";

declare module "next-auth" {
  interface Session {
      user: User;
      accessToken: string;
    };
  }

