/* Registro das patologias. Para incluir uma nova: crie a pasta com index.jsx exportando o módulo e adicione aqui. */
import { alzheimer } from "./alzheimer/index.jsx";
import { epilepsia } from "./epilepsia/index.jsx";
import { parkinson } from "./parkinson/index.jsx";

export const patologias = [
  alzheimer,
  epilepsia,
  parkinson,
  { id: "em", nome: "Esclerose múltipla" },
  { id: "distonia", nome: "Distonias e espasticidade" },
  { id: "miastenia", nome: "Miastenia gravis" },
];
export const ativas = patologias.filter((p) => p.ativo);
export const patologia = (id) => patologias.find((p) => p.id === id && p.ativo);
