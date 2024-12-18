import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
// @ts-ignore
self.MonacoEnvironment = {
    getWorkerUrl: function (_moduleId, label) {
        if (label === 'json') {
            return './json.worker.bundle.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return './css.worker.bundle.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return './html.worker.bundle.js';
        }
        if (label === 'typescript' || label === 'javascript') {
            return './ts.worker.bundle.js';
        }
        return './editor.worker.bundle.js';
    }
};
export const Editor = () => {
    const divEl = useRef(null);
    let editor;
    useEffect(() => {
        if (divEl.current) {
            editor = monaco.editor.create(divEl.current, {
                value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
                language: 'typescript'
            });
        }
        return () => {
            editor.dispose();
        };
    }, []);
    return <div className="Editor" ref={divEl}></div>;
};
//# sourceMappingURL=Editor.js.map