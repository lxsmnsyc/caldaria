export default function createURLCSSModule(
  p: string,
  json: Record<string, string>,
) {
  return `
export const styles = ${JSON.stringify(json)};
export { default as source } from ${JSON.stringify(`${p}?url-only`)};
`;
}
