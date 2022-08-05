export default function createRawCSSModule(css: string, json: Record<string, string>) {
  return `export const styles = ${JSON.stringify(json)};
export const sheet = ${JSON.stringify(css)};
`;
}
