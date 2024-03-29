export default function createLazyCSS(
  id: string,
  content: string,
  json: Record<string, string>,
) {
  return `import { renderStyle } from 'caldaria/render-client';
renderStyle(${JSON.stringify(id)}, ${JSON.stringify(content)});
export default ${JSON.stringify(json)};
`;
}
