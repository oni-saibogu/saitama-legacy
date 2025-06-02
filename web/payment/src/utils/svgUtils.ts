import { format } from "./format";

export const toSVGURL = (svg: string) =>
  format("data:image/svg+xml;base64,%", btoa(svg));
