"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    document.title = 'mystery playground';
    const include = src => new Promise(cb => {
        const js = document.createElement('script');
        js.src = src;
        js.type = 'text/javascript';
        js.addEventListener('load', cb);
        document.head.appendChild(js);
    });
    yield include('./monaco-editor/samples/node_modules/monaco-editor/min/vs/loader.js');
    require.config({ paths: { vs: './monaco-editor/samples/node_modules/monaco-editor/min/vs' } });
    const style_rule = (() => {
        const style = document.head.appendChild(document.createElement('style'));
        const ss = style.sheet;
        return ss ? x => ss.insertRule(x, 0) : () => -1;
    })();
    style_rule(`#output p {
    color: red; }`);
    style_rule(`@font-face {
    font-family: CMU Typewriter Text;
    src: url("./cmuntt.ttf"); }`);
    style_rule(`html {
    width: 100%;
    height: 100%; }`);
    style_rule(`body {
    width: 100%;
    height: 100%;
    font-family: CMU Typewriter Text;
    font-size: 11pt;
    line-height: 13pt;
    margin: 0;
    padding: 0 }`);
    style_rule(`@media (prefers-color-scheme: light) {
    body {
      background: white;
      color: black;
      caret-color: black; } }`);
    style_rule(`@media (prefers-color-scheme: dark) {
    body {
      background: black;
      color: white;
      caret-color: white; } }`);
    const create_element = (tag, mod, children) => {
        const elem = document.createElement(tag);
        mod.apply(elem);
        elem.append(...children);
        return elem;
    };
    const entry = create_element('div', function () {
        this.style.width = "100%";
        this.style.height = "80%";
        this.style.resize = "vertical";
    }, []);
    const output = create_element("div", function () {
        this.setAttribute('id', 'output');
        this.style.width = "100%";
        this.style.height = "20%";
        this.style.whiteSpace = "pre-wrap";
        this.style.overflowWrap = "break-word";
        this.style.overflowX = "hidden";
        this.style.overflowY = "scroll";
        this.style.wordBreak = "break-all";
    }, []);
    document.body.append(entry, output);
    require(['vs/editor/editor.main'], function () {
        const editor = monaco.editor.create(entry, {
            value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
            language: 'javascript',
            minimap: {
                maxColumn: 80
            },
            lineNumbersMinChars: 5,
            fontFamily: 'CMU Typewriter Text',
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true
        });
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            monaco.editor.defineTheme('hcblack2', {
                base: 'hc-black',
                inherit: true,
                rules: [],
                colors: {
                    "editorIndentGuide.background": "#555555"
                }
            });
            monaco.editor.setTheme('hcblack2');
        }
        editor.setValue(localStorage.getItem('jsplayground-system') || '');
        let win = null;
        const reset = () => {
            localStorage.setItem('jsplayground-system', editor.getValue());
            if (!win || win.closed) {
                win = window.open();
                if (win) {
                    win.addEventListener('error', e => {
                        const p = document.createElement('p');
                        p.innerHTML = `${e.lineno},${e.colno}: ${e.message}`;
                        output.appendChild(p);
                    });
                }
            }
            if (win) {
                output.innerHTML = '';
                const clearScript = win.document.createElement('script');
                clearScript.setAttribute('type', "text/javascript");
                clearScript.innerHTML = `document.documentElement.innerHTML = ""`;
                win.document.head.appendChild(clearScript);
                const blob = new Blob([editor.getValue()], { type: "text/javascript", });
                const url = URL.createObjectURL(blob);
                const script = win.document.createElement('script');
                script.setAttribute('type', "text/javascript");
                script.setAttribute('src', url);
                win.document.head.appendChild(script);
                const revokeScript = win.document.createElement('script');
                revokeScript.setAttribute('type', "text/javascript");
                revokeScript.innerHTML = `URL.revokeObjectURL("${url}")`;
                win.document.head.appendChild(revokeScript);
            }
        };
        editor.getModel().onDidChangeContent(reset);
    });
}))();
//# sourceMappingURL=plotter.js.map