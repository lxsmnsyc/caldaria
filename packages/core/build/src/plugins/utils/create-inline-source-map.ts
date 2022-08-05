import type { RawSourceMap } from 'source-map-js';

export default function createInlineSourceMap(
  source: string,
  sourceMap: RawSourceMap | undefined,
  isDev?: boolean,
) {
  if (isDev && sourceMap) {
    const instance = Buffer.from(JSON.stringify(sourceMap)).toString('base64');
    return `${source}\n/*# sourceMappingURL=data:application/json;base64,${instance} */`;
  }
  return source;
}
