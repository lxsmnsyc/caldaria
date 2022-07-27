import {
  cyan,
  green,
  red,
  yellow,
} from 'rigidity-shared';

type DiagnosticCategory = 'error' | 'message' | 'suggestion' | 'warning';

interface DiagnosticDisplay {
  symbol: string;
  color: (value: string) => string;
}

type DiagnosticDisplayOptions = {
  [key in DiagnosticCategory]: DiagnosticDisplay;
};

const DIAGNOSTIC_DISPLAYS: DiagnosticDisplayOptions = {
  error: {
    symbol: '✖',
    color: red,
  },
  message: {
    symbol: '✔',
    color: green,
  },
  suggestion: {
    symbol: 'ℹ',
    color: cyan,
  },
  warning: {
    symbol: '⚠',
    color: yellow,
  },
};

export default function createDiagnosticMessage(
  category: DiagnosticCategory,
  message: string,
): void {
  const display = DIAGNOSTIC_DISPLAYS[category];
  console.log(`${display.color(display.symbol)} ${message}`);
}
