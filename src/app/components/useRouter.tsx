import { useRouter as useNextRouter } from 'next/router'; // Importa el hook useRouter de Next.js

const useRouter = () => {
  const router = useNextRouter(); // Utiliza el hook useRouter de Next.js para obtener el router

  // Verifica si el router está definido
  if (!router) {
    throw new Error('NextRouter was not found. Make sure you have mounted the NextRouter.');
  }

  return router;
};

export default useRouter;