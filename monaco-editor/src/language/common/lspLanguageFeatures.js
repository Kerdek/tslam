/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as lsTypes from 'vscode-languageserver-types';
import { languages, editor, Uri, Range, MarkerSeverity } from '../../fillers/monaco-editor-core';
export class DiagnosticsAdapter {
    _languageId;
    _worker;
    _disposables = [];
    _listener = Object.create(null);
    constructor(_languageId, _worker, configChangeEvent) {
        this._languageId = _languageId;
        this._worker = _worker;
        const onModelAdd = (model) => {
            let modeId = model.getLanguageId();
            if (modeId !== this._languageId) {
                return;
            }
            let handle;
            this._listener[model.uri.toString()] = model.onDidChangeContent(() => {
                window.clearTimeout(handle);
                handle = window.setTimeout(() => this._doValidate(model.uri, modeId), 500);
            });
            this._doValidate(model.uri, modeId);
        };
        const onModelRemoved = (model) => {
            editor.setModelMarkers(model, this._languageId, []);
            let uriStr = model.uri.toString();
            let listener = this._listener[uriStr];
            if (listener) {
                listener.dispose();
                delete this._listener[uriStr];
            }
        };
        this._disposables.push(editor.onDidCreateModel(onModelAdd));
        this._disposables.push(editor.onWillDisposeModel(onModelRemoved));
        this._disposables.push(editor.onDidChangeModelLanguage((event) => {
            onModelRemoved(event.model);
            onModelAdd(event.model);
        }));
        this._disposables.push(configChangeEvent((_) => {
            editor.getModels().forEach((model) => {
                if (model.getLanguageId() === this._languageId) {
                    onModelRemoved(model);
                    onModelAdd(model);
                }
            });
        }));
        this._disposables.push({
            dispose: () => {
                editor.getModels().forEach(onModelRemoved);
                for (let key in this._listener) {
                    this._listener[key].dispose();
                }
            }
        });
        editor.getModels().forEach(onModelAdd);
    }
    dispose() {
        this._disposables.forEach((d) => d && d.dispose());
        this._disposables.length = 0;
    }
    _doValidate(resource, languageId) {
        this._worker(resource)
            .then((worker) => {
            return worker.doValidation(resource.toString());
        })
            .then((diagnostics) => {
            const markers = diagnostics.map((d) => toDiagnostics(resource, d));
            let model = editor.getModel(resource);
            if (model && model.getLanguageId() === languageId) {
                editor.setModelMarkers(model, languageId, markers);
            }
        })
            .then(undefined, (err) => {
            console.error(err);
        });
    }
}
function toSeverity(lsSeverity) {
    switch (lsSeverity) {
        case lsTypes.DiagnosticSeverity.Error:
            return MarkerSeverity.Error;
        case lsTypes.DiagnosticSeverity.Warning:
            return MarkerSeverity.Warning;
        case lsTypes.DiagnosticSeverity.Information:
            return MarkerSeverity.Info;
        case lsTypes.DiagnosticSeverity.Hint:
            return MarkerSeverity.Hint;
        default:
            return MarkerSeverity.Info;
    }
}
function toDiagnostics(resource, diag) {
    let code = typeof diag.code === 'number' ? String(diag.code) : diag.code;
    return {
        severity: toSeverity(diag.severity),
        startLineNumber: diag.range.start.line + 1,
        startColumn: diag.range.start.character + 1,
        endLineNumber: diag.range.end.line + 1,
        endColumn: diag.range.end.character + 1,
        message: diag.message,
        code: code,
        source: diag.source
    };
}
export class CompletionAdapter {
    _worker;
    _triggerCharacters;
    constructor(_worker, _triggerCharacters) {
        this._worker = _worker;
        this._triggerCharacters = _triggerCharacters;
    }
    get triggerCharacters() {
        return this._triggerCharacters;
    }
    provideCompletionItems(model, position, context, token) {
        const resource = model.uri;
        return this._worker(resource)
            .then((worker) => {
            return worker.doComplete(resource.toString(), fromPosition(position));
        })
            .then((info) => {
            if (!info) {
                return;
            }
            const wordInfo = model.getWordUntilPosition(position);
            const wordRange = new Range(position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn);
            const items = info.items.map((entry) => {
                const item = {
                    label: entry.label,
                    insertText: entry.insertText || entry.label,
                    sortText: entry.sortText,
                    filterText: entry.filterText,
                    documentation: entry.documentation,
                    detail: entry.detail,
                    command: toCommand(entry.command),
                    range: wordRange,
                    kind: toCompletionItemKind(entry.kind)
                };
                if (entry.textEdit) {
                    if (isInsertReplaceEdit(entry.textEdit)) {
                        item.range = {
                            insert: toRange(entry.textEdit.insert),
                            replace: toRange(entry.textEdit.replace)
                        };
                    }
                    else {
                        item.range = toRange(entry.textEdit.range);
                    }
                    item.insertText = entry.textEdit.newText;
                }
                if (entry.additionalTextEdits) {
                    item.additionalTextEdits =
                        entry.additionalTextEdits.map(toTextEdit);
                }
                if (entry.insertTextFormat === lsTypes.InsertTextFormat.Snippet) {
                    item.insertTextRules = languages.CompletionItemInsertTextRule.InsertAsSnippet;
                }
                return item;
            });
            return {
                isIncomplete: info.isIncomplete,
                suggestions: items
            };
        });
    }
}
export function fromPosition(position) {
    if (!position) {
        return void 0;
    }
    return { character: position.column - 1, line: position.lineNumber - 1 };
}
export function fromRange(range) {
    if (!range) {
        return void 0;
    }
    return {
        start: {
            line: range.startLineNumber - 1,
            character: range.startColumn - 1
        },
        end: { line: range.endLineNumber - 1, character: range.endColumn - 1 }
    };
}
export function toRange(range) {
    if (!range) {
        return void 0;
    }
    return new Range(range.start.line + 1, range.start.character + 1, range.end.line + 1, range.end.character + 1);
}
function isInsertReplaceEdit(edit) {
    return (typeof edit.insert !== 'undefined' &&
        typeof edit.replace !== 'undefined');
}
function toCompletionItemKind(kind) {
    const mItemKind = languages.CompletionItemKind;
    switch (kind) {
        case lsTypes.CompletionItemKind.Text:
            return mItemKind.Text;
        case lsTypes.CompletionItemKind.Method:
            return mItemKind.Method;
        case lsTypes.CompletionItemKind.Function:
            return mItemKind.Function;
        case lsTypes.CompletionItemKind.Constructor:
            return mItemKind.Constructor;
        case lsTypes.CompletionItemKind.Field:
            return mItemKind.Field;
        case lsTypes.CompletionItemKind.Variable:
            return mItemKind.Variable;
        case lsTypes.CompletionItemKind.Class:
            return mItemKind.Class;
        case lsTypes.CompletionItemKind.Interface:
            return mItemKind.Interface;
        case lsTypes.CompletionItemKind.Module:
            return mItemKind.Module;
        case lsTypes.CompletionItemKind.Property:
            return mItemKind.Property;
        case lsTypes.CompletionItemKind.Unit:
            return mItemKind.Unit;
        case lsTypes.CompletionItemKind.Value:
            return mItemKind.Value;
        case lsTypes.CompletionItemKind.Enum:
            return mItemKind.Enum;
        case lsTypes.CompletionItemKind.Keyword:
            return mItemKind.Keyword;
        case lsTypes.CompletionItemKind.Snippet:
            return mItemKind.Snippet;
        case lsTypes.CompletionItemKind.Color:
            return mItemKind.Color;
        case lsTypes.CompletionItemKind.File:
            return mItemKind.File;
        case lsTypes.CompletionItemKind.Reference:
            return mItemKind.Reference;
    }
    return mItemKind.Property;
}
function fromCompletionItemKind(kind) {
    const mItemKind = languages.CompletionItemKind;
    switch (kind) {
        case mItemKind.Text:
            return lsTypes.CompletionItemKind.Text;
        case mItemKind.Method:
            return lsTypes.CompletionItemKind.Method;
        case mItemKind.Function:
            return lsTypes.CompletionItemKind.Function;
        case mItemKind.Constructor:
            return lsTypes.CompletionItemKind.Constructor;
        case mItemKind.Field:
            return lsTypes.CompletionItemKind.Field;
        case mItemKind.Variable:
            return lsTypes.CompletionItemKind.Variable;
        case mItemKind.Class:
            return lsTypes.CompletionItemKind.Class;
        case mItemKind.Interface:
            return lsTypes.CompletionItemKind.Interface;
        case mItemKind.Module:
            return lsTypes.CompletionItemKind.Module;
        case mItemKind.Property:
            return lsTypes.CompletionItemKind.Property;
        case mItemKind.Unit:
            return lsTypes.CompletionItemKind.Unit;
        case mItemKind.Value:
            return lsTypes.CompletionItemKind.Value;
        case mItemKind.Enum:
            return lsTypes.CompletionItemKind.Enum;
        case mItemKind.Keyword:
            return lsTypes.CompletionItemKind.Keyword;
        case mItemKind.Snippet:
            return lsTypes.CompletionItemKind.Snippet;
        case mItemKind.Color:
            return lsTypes.CompletionItemKind.Color;
        case mItemKind.File:
            return lsTypes.CompletionItemKind.File;
        case mItemKind.Reference:
            return lsTypes.CompletionItemKind.Reference;
    }
    return lsTypes.CompletionItemKind.Property;
}
export function toTextEdit(textEdit) {
    if (!textEdit) {
        return void 0;
    }
    return {
        range: toRange(textEdit.range),
        text: textEdit.newText
    };
}
function toCommand(c) {
    return c && c.command === 'editor.action.triggerSuggest'
        ? { id: c.command, title: c.title, arguments: c.arguments }
        : undefined;
}
export class HoverAdapter {
    _worker;
    constructor(_worker) {
        this._worker = _worker;
    }
    provideHover(model, position, token) {
        let resource = model.uri;
        return this._worker(resource)
            .then((worker) => {
            return worker.doHover(resource.toString(), fromPosition(position));
        })
            .then((info) => {
            if (!info) {
                return;
            }
            return {
                range: toRange(info.range),
                contents: toMarkedStringArray(info.contents)
            };
        });
    }
}
function isMarkupContent(thing) {
    return (thing && typeof thing === 'object' && typeof thing.kind === 'string');
}
function toMarkdownString(entry) {
    if (typeof entry === 'string') {
        return {
            value: entry
        };
    }
    if (isMarkupContent(entry)) {
        if (entry.kind === 'plaintext') {
            return {
                value: entry.value.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&')
            };
        }
        return {
            value: entry.value
        };
    }
    return { value: '```' + entry.language + '\n' + entry.value + '\n```\n' };
}
function toMarkedStringArray(contents) {
    if (!contents) {
        return void 0;
    }
    if (Array.isArray(contents)) {
        return contents.map(toMarkdownString);
    }
    return [toMarkdownString(contents)];
}
export class DocumentHighlightAdapter {
    _worker;
    constructor(_worker) {
        this._worker = _worker;
    }
    provideDocumentHighlights(model, position, token) {
        const resource = model.uri;
        return this._worker(resource)
            .then((worker) => worker.findDocumentHighlights(resource.toString(), fromPosition(position)))
            .then((entries) => {
            if (!entries) {
                return;
            }
            return entries.map((entry) => {
                return {
                    range: toRange(entry.range),
                    kind: toDocumentHighlightKind(entry.kind)
                };
            });
        });
    }
}
function toDocumentHighlightKind(kind) {
    switch (kind) {
        case lsTypes.DocumentHighlightKind.Read:
            return languages.DocumentHighlightKind.Read;
        case lsTypes.DocumentHighlightKind.Write:
            return languages.DocumentHighlightKind.Write;
        case lsTypes.DocumentHighlightKind.Text:
            return languages.DocumentHighlightKind.Text;
    }
    return languages.DocumentHighlightKind.Text;
}
export class DefinitionAdapter {
    _worker;
    constructor(_worker) {
        this._worker = _worker;
    }
    provideDefinition(model, position, token) {
        const resource = model.uri;
        return this._worker(resource)
            .then((worker) => {
            return worker.findDefinition(resource.toString(), fromPosition(position));
        })
            .then((definition) => {
            if (!definition) {
                return;
            }
            return [toLocation(definition)];
        });
    }
}
function toLocation(location) {
    return {
        uri: Uri.parse(location.uri),
        range: toRange(location.range)
    };
}
export class ReferenceAdapter {
    _worker;
    constructor(_worker) {
        this._worker = _worker;
    }
    provideReferences(model, position, context, token) {
        const resource = model.uri;
        return this._worker(resource)
            .then((worker) => {
            return worker.findReferences(resource.toString(), fromPosition(position));
        })
            .then((entries) => {
            if (!entries) {
                return;
            }
            return entries.map(toLocation);
        });
    }
}
export class RenameAdapter {
    _worker;
    constructor(_worker) {
        this._worker = _worker;
    }
    provideRenameEdits(model, position, newName, token) {
        const resource = model.uri;
        return this._worker(resource)
            .then((worker) => {
            return worker.doRename(resource.toString(), fromPosition(position), newName);
        })
            .then((edit) => {
            return toWorkspaceEdit(edit);
        });
    }
}
function toWorkspaceEdit(edit) {
    if (!edit || !edit.changes) {
        return void 0;
    }
    let resourceEdits = [];
    for (let uri in edit.changes) {
        const _uri = Uri.parse(uri);
        for (let e of edit.changes[uri]) {
            resourceEdits.push({
                resource: _uri,
                versionId: undefined,
                textEdit: {
                    range: toRange(e.range),
                    text: e.newText
                }
            });
        }
    }
    return {
        edits: resourceEdits
    };
}
export class DocumentSymbolAdapter {
    _worker;
    constructor(_worker) {
        this._worker = _worker;
    }
    provideDocumentSymbols(model, token) {
        const resource = model.uri;
        return this._worker(resource)
            .then((worker) => worker.findDocumentSymbols(resource.toString()))
            .then((items) => {
            if (!items) {
                return;
            }
            return items.map((item) => {
                if (isDocumentSymbol(item)) {
                    return toDocumentSymbol(item);
                }
                return {
                    name: item.name,
                    detail: '',
                    containerName: item.containerName,
                    kind: toSymbolKind(item.kind),
                    range: toRange(item.location.range),
                    selectionRange: toRange(item.location.range),
                    tags: []
                };
            });
        });
    }
}
function isDocumentSymbol(symbol) {
    return 'children' in symbol;
}
function toDocumentSymbol(symbol) {
    return {
        name: symbol.name,
        detail: symbol.detail ?? '',
        kind: toSymbolKind(symbol.kind),
        range: toRange(symbol.range),
        selectionRange: toRange(symbol.selectionRange),
        tags: symbol.tags ?? [],
        children: (symbol.children ?? []).map((item) => toDocumentSymbol(item))
    };
}
function toSymbolKind(kind) {
    let mKind = languages.SymbolKind;
    switch (kind) {
        case lsTypes.SymbolKind.File:
            return mKind.File;
        case lsTypes.SymbolKind.Module:
            return mKind.Module;
        case lsTypes.SymbolKind.Namespace:
            return mKind.Namespace;
        case lsTypes.SymbolKind.Package:
            return mKind.Package;
        case lsTypes.SymbolKind.Class:
            return mKind.Class;
        case lsTypes.SymbolKind.Method:
            return mKind.Method;
        case lsTypes.SymbolKind.Property:
            return mKind.Property;
        case lsTypes.SymbolKind.Field:
            return mKind.Field;
        case lsTypes.SymbolKind.Constructor:
            return mKind.Constructor;
        case lsTypes.SymbolKind.Enum:
            return mKind.Enum;
        case lsTypes.SymbolKind.Interface:
            return mKind.Interface;
        case lsTypes.SymbolKind.Function:
            return mKind.Function;
        case lsTypes.SymbolKind.Variable:
            return mKind.Variable;
        case lsTypes.SymbolKind.Constant:
            return mKind.Constant;
        case lsTypes.SymbolKind.String:
            return mKind.String;
        case lsTypes.SymbolKind.Number:
            return mKind.Number;
        case lsTypes.SymbolKind.Boolean:
            return mKind.Boolean;
        case lsTypes.SymbolKind.Array:
            return mKind.Array;
    }
    return mKind.Function;
}
export class DocumentLinkAdapter {
    _worker;
    constructor(_worker) {
        this._worker = _worker;
    }
    provideLinks(model, token) {
        const resource = model.uri;
        return this._worker(resource)
            .then((worker) => worker.findDocumentLinks(resource.toString()))
            .then((items) => {
            if (!items) {
                return;
            }
            return {
                links: items.map((item) => ({
                    range: toRange(item.range),
                    url: item.target
                }))
            };
        });
    }
}
export class DocumentFormattingEditProvider {
    _worker;
    constructor(_worker) {
        this._worker = _worker;
    }
    provideDocumentFormattingEdits(model, options, token) {
        const resource = model.uri;
        return this._worker(resource).then((worker) => {
            return worker
                .format(resource.toString(), null, fromFormattingOptions(options))
                .then((edits) => {
                if (!edits || edits.length === 0) {
                    return;
                }
                return edits.map(toTextEdit);
            });
        });
    }
}
export class DocumentRangeFormattingEditProvider {
    _worker;
    canFormatMultipleRanges = false;
    constructor(_worker) {
        this._worker = _worker;
    }
    provideDocumentRangeFormattingEdits(model, range, options, token) {
        const resource = model.uri;
        return this._worker(resource).then((worker) => {
            return worker
                .format(resource.toString(), fromRange(range), fromFormattingOptions(options))
                .then((edits) => {
                if (!edits || edits.length === 0) {
                    return;
                }
                return edits.map(toTextEdit);
            });
        });
    }
}
function fromFormattingOptions(options) {
    return {
        tabSize: options.tabSize,
        insertSpaces: options.insertSpaces
    };
}
export class DocumentColorAdapter {
    _worker;
    constructor(_worker) {
        this._worker = _worker;
    }
    provideDocumentColors(model, token) {
        const resource = model.uri;
        return this._worker(resource)
            .then((worker) => worker.findDocumentColors(resource.toString()))
            .then((infos) => {
            if (!infos) {
                return;
            }
            return infos.map((item) => ({
                color: item.color,
                range: toRange(item.range)
            }));
        });
    }
    provideColorPresentations(model, info, token) {
        const resource = model.uri;
        return this._worker(resource)
            .then((worker) => worker.getColorPresentations(resource.toString(), info.color, fromRange(info.range)))
            .then((presentations) => {
            if (!presentations) {
                return;
            }
            return presentations.map((presentation) => {
                let item = {
                    label: presentation.label
                };
                if (presentation.textEdit) {
                    item.textEdit = toTextEdit(presentation.textEdit);
                }
                if (presentation.additionalTextEdits) {
                    item.additionalTextEdits =
                        presentation.additionalTextEdits.map(toTextEdit);
                }
                return item;
            });
        });
    }
}
export class FoldingRangeAdapter {
    _worker;
    constructor(_worker) {
        this._worker = _worker;
    }
    provideFoldingRanges(model, context, token) {
        const resource = model.uri;
        return this._worker(resource)
            .then((worker) => worker.getFoldingRanges(resource.toString(), context))
            .then((ranges) => {
            if (!ranges) {
                return;
            }
            return ranges.map((range) => {
                const result = {
                    start: range.startLine + 1,
                    end: range.endLine + 1
                };
                if (typeof range.kind !== 'undefined') {
                    result.kind = toFoldingRangeKind(range.kind);
                }
                return result;
            });
        });
    }
}
function toFoldingRangeKind(kind) {
    switch (kind) {
        case lsTypes.FoldingRangeKind.Comment:
            return languages.FoldingRangeKind.Comment;
        case lsTypes.FoldingRangeKind.Imports:
            return languages.FoldingRangeKind.Imports;
        case lsTypes.FoldingRangeKind.Region:
            return languages.FoldingRangeKind.Region;
    }
    return void 0;
}
export class SelectionRangeAdapter {
    _worker;
    constructor(_worker) {
        this._worker = _worker;
    }
    provideSelectionRanges(model, positions, token) {
        const resource = model.uri;
        return this._worker(resource)
            .then((worker) => worker.getSelectionRanges(resource.toString(), positions.map(fromPosition)))
            .then((selectionRanges) => {
            if (!selectionRanges) {
                return;
            }
            return selectionRanges.map((selectionRange) => {
                const result = [];
                while (selectionRange) {
                    result.push({ range: toRange(selectionRange.range) });
                    selectionRange = selectionRange.parent;
                }
                return result;
            });
        });
    }
}
//#endregion
//# sourceMappingURL=lspLanguageFeatures.js.map