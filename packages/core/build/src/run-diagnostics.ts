import { BuildResult } from 'esbuild';
import generateESBuildDiagnostics from './create-esbuild-diagnostics';

export default function runDiagnostics(result: BuildResult): void {
  if (result.errors.length) {
    generateESBuildDiagnostics(false, result.errors);
  }
  if (result.warnings.length) {
    generateESBuildDiagnostics(true, result.warnings);
  }
}
