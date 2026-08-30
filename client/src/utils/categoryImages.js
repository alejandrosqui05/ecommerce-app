import conectores from "../assets/categories/conectores.jpg";
import partesDeMotor from "../assets/categories/partes-de-motor.jpg";
import sistemaDeInyeccion from "../assets/categories/sistema-de-inyeccion.jpg";
import suspension from "../assets/categories/suspension.jpg";

const IMAGE_RULES = [
  { keywords: ["conector"], image: conectores, position: "50% 50%" },
  { keywords: ["motor"], image: partesDeMotor, position: "50% 50%" },
  { keywords: ["inyec"], image: sistemaDeInyeccion, position: "50% 50%" },
  { keywords: ["suspension", "delantero"], image: suspension, position: "50% 50%" },
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function findRule(categoryName) {
  const name = normalize(categoryName || "");
  return IMAGE_RULES.find(({ keywords }) => keywords.some((k) => name.includes(k)));
}

export function getCategoryImage(categoryName) {
  return findRule(categoryName)?.image ?? null;
}

export function getCategoryImagePosition(categoryName) {
  return findRule(categoryName)?.position ?? "50% 50%";
}
