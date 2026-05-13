export const stringToRGBColor = (inputString: string): string => {
  // Calculamos un valor hash basado en el string de entrada
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    hash = inputString.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generamos componentes de color RGB a partir del hash
  const r = (hash & 0xff) % 256;
  const g = ((hash >> 8) & 0xff) % 256;
  const b = ((hash >> 16) & 0xff) % 256;

  // Devolvemos el color en formato RGB
  return `rgb(${r}, ${g}, ${b})`;
};
