import { Message } from 'esbuild';
import { blue, yellow } from 'rigidity-shared';
import createDiagnosticMessage from './create-diagnostic-message';

function createEsbuildDiagnosticString(message: Message): string {
  const baseMessage = message.text;
  if (message.location) {
    const { location } = message;
    const file = blue(location.file);
    const line = yellow(`${location.line}`);
    const column = yellow(`${location.column + 1}`);
    return `${file} (${line}, ${column}): ${baseMessage}`;
  }

  return baseMessage;
}

export default function generateESBuildDiagnostics(isWarning: boolean, messages: Message[]): void {
  for (let i = 0, len = messages.length; i < len; i += 1) {
    createDiagnosticMessage(
      isWarning ? 'warning' : 'error',
      createEsbuildDiagnosticString(messages[i]),
    );
  }
}
