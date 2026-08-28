import conectores from "../assets/categories/conectores.jpg";
import partesDeMotor from "../assets/categories/partes-de-motor.jpg";
import sistemaDeInyeccion from "../assets/categories/sistema-de-inyeccion.jpg";
import suspension from "../assets/categories/suspension.jpg";

const IMAGE_RULES = [
  { keywords: ["conector"], image: conectores },
  { keywords: ["motor"], image: partesDeMotor },
  { keywords: ["inyec"], image: sistemaDeInyeccion },
  { keywords: ["suspension", "delantero"], image: suspension },
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function getCategoryImage(categoryName) {
  const name = normalize(categoryName || "");
  const rule = IMAGE_RULES.find(({ keywords }) => keywords.some((k) => name.includes(k)));
  return rule?.image ?? null;
}
