import { OnResolveArgs, OnResolveResult } from 'esbuild';

export default function forkToCSSInJS(
  targetNamespace: string,
  kind: OnResolveArgs['kind'],
  args: OnResolveResult,
): OnResolveResult {
  if (kind === 'import-rule' || kind === 'entry-point') {
    return {
      path: args.path,
      namespace: targetNamespace,
    };
  }
  return args;
}
