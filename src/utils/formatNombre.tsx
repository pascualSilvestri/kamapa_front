// utils.ts
export const formatNombre = (nombre: string): string => {
    // Divide el nombre en palabras separadas por espacio
    const words = nombre.split(' ');

    // Mapea cada palabra para obtener la primera letra en mayúscula seguida de un punto "."
    const formattedWords = words.map(word => `${word.charAt(0).toUpperCase()}.`);

    // Une las palabras formateadas en un solo string separado por espacio
    return formattedWords.join(' ');
};