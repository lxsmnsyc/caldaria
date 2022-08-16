// Intentionally not using template literal for performance.
const format = (startCode: number, endCode: number) => (
  (string: string) => `\u001B[${startCode}m${string}\u001B[${endCode}m`
);

export const reset = /* @__PURE__ */format(0, 0);
export const bold = /* @__PURE__ */format(1, 22);
export const dim = /* @__PURE__ */format(2, 22);
export const italic = /* @__PURE__ */format(3, 23);
export const underline = /* @__PURE__ */format(4, 24);
export const overline = /* @__PURE__ */format(53, 55);
export const inverse = /* @__PURE__ */format(7, 27);
export const hidden = /* @__PURE__ */format(8, 28);
export const strikethrough = /* @__PURE__ */format(9, 29);

export const black = /* @__PURE__ */format(30, 39);
export const red = /* @__PURE__ */format(31, 39);
export const green = /* @__PURE__ */format(32, 39);
export const yellow = /* @__PURE__ */format(33, 39);
export const blue = /* @__PURE__ */format(34, 39);
export const magenta = /* @__PURE__ */format(35, 39);
export const cyan = /* @__PURE__ */format(36, 39);
export const white = /* @__PURE__ */format(37, 39);
export const gray = /* @__PURE__ */format(90, 39);

export const bgBlack = /* @__PURE__ */format(40, 49);
export const bgRed = /* @__PURE__ */format(41, 49);
export const bgGreen = /* @__PURE__ */format(42, 49);
export const bgYellow = /* @__PURE__ */format(43, 49);
export const bgBlue = /* @__PURE__ */format(44, 49);
export const bgMagenta = /* @__PURE__ */format(45, 49);
export const bgCyan = /* @__PURE__ */format(46, 49);
export const bgWhite = /* @__PURE__ */format(47, 49);
export const bgGray = /* @__PURE__ */format(100, 49);

export function log(prefix: string, message: string) {
  if (typeof window === 'undefined') {
    console.log(`${magenta(`[caldaria:${prefix}]`)} ${message}`);
  } else {
    console.log(`%c[caldaria:${prefix}] %c${message}`, 'font-weight: bold; color: #a855f7', 'color: inherit');
  }
}
