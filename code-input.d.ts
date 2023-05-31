declare class Template {}

declare class CodeInput {
  templates: { custom(highlight: (pre: HTMLElement) => HTMLElement, usePre: boolean, setClass: boolean, giveCodeInput: boolean, plugins: []): Template };
  registerTemplate(name: "syntax-highlighted", template: Template): void; }

declare const codeInput: CodeInput;