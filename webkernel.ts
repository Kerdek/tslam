import { reads } from "./lang.js"
import { Graph, evaluate, application, boolean, reference, string, uni, str, bol, app, ref } from "./graph.js"

const create_element: <K extends keyof HTMLElementTagNameMap>(tag: K, mod: (this: HTMLElementTagNameMap[K]) => void, children: Node[]) => HTMLElementTagNameMap[K] = (tag, mod, children) => {
const elem = document.createElement(tag);
mod.apply(elem);
elem.append(...children);
return elem; }

const intro = create_element('div', function () {
  this.innerText = [
    "Edit the program in the top box.",
    "Press Ctrl+Enter to run.",
    "Type in the bottom box to fuel the system."].join(' ');
  this.className = "hlconst";
  this.style.width = "100%";
  this.style.height = "100%"; }, []);

const system = create_element('textarea', function () {
  this.spellcheck = false;
  this.style.width = "100%";
  this.style.height = "100%";
  this.style.border = "none";
  this.style.background = "transparent";
  this.style.color = "inherit";
  this.style.font = "inherit";
  this.style.whiteSpace = "pre-wrap";
  this.style.overflowWrap = "break-word";
  this.style.overflowY = "scroll";
  this.style.resize = "vertical"; }, []);

const entry = create_element('div', function () {
  this.className = "wb";
  this.style.width = "100%";
  this.style.height = "100%";
  this.style.resize = "vertical"; }, [system]);

const output = create_element("div", function () {
  this.className = "wb";
  this.style.width = "100%";
  this.style.height = "100%";
  this.style.whiteSpace = "pre-wrap";
  this.style.overflowWrap = "break-word";
  this.style.overflowX = "hidden";
  this.style.overflowY = "scroll";
  this.style.wordBreak = "break-all"; }, []);

document.body.append(create_element('table', function () {
  this.style.tableLayout = "fixed";
  this.style.borderCollapse = "collapse";
  this.style.width = "100%";
  this.style.height = "100%"; }, [
  create_element('tr', function () {}, [
    create_element('td', function () {}, [intro])]),
  create_element('tr', function () {}, [
    create_element('td', function () {}, [entry])]),
  create_element('tr', function () {}, [
    create_element('td', function () {}, [output])])]));

const tail = bol(false);
const head = uni(Symbol.for('a'),
  uni(Symbol.for('b'),
    ref(Symbol.for('a'))));

const getKeyHandler: Graph[] = [];

const putStrId = Symbol.for('putStr');
const onKeyId = Symbol.for('onKey');
const bindId = Symbol.for('bind');
const passId = Symbol.for('pass');
const clearId = Symbol.for('clear');

const doPutStr: (str: Graph) => Promise<boolean> = async str => {
  if (string in str) {
    output.innerText += str.val;
    return true; }
  else {
    for (;;) {
      const each = evaluate(app(str, head));
      str = evaluate(app(str, tail));
      if (boolean in each && each.val) return true;
      else if (!await doPutStr(each)) return false; } } }

const doIO: (io: Graph) => Promise<Graph> = async io => {
for (;;) {
  const err = async () => {
    return bol(false); }
  if (application in io) {
    if (application in io.lhs) {
      if (reference in io.lhs.lhs) {
        if (io.lhs.lhs.id == bindId) {
          const val = await doIO(evaluate(io.lhs.rhs));
          io = evaluate(app(io.rhs, val)); }
        else return await err(); }
      else return await err(); }
    else if (reference in io.lhs) {
      if (io.lhs.id == putStrId) return bol(await doPutStr(io.rhs));
      else if (io.lhs.id == onKeyId) {
        getKeyHandler.push(io.rhs);
        return bol(true); }
      else return await err(); }
    else return await err(); }
  else if (reference in io) {
    if (io.id == passId) {
      return bol(true); }
    else if (io.id == clearId) {
      output.innerText = '';
      return bol(true); }
    else return await err(); }
  else return await err(); } }

const reset = () => {
  let program = reads([system.value]);
  if (program) doIO(evaluate(program)); }

window.onkeydown = async i => {
i.key == 'a'; // converts i.key to single-letter form lmao
if (document.activeElement === system) {
  if (i.key === "Tab" && !i.ctrlKey && !i.altKey && !i.metaKey) {
    i.preventDefault();
    var s = system.selectionStart, e = system.selectionEnd;
    if (i.shiftKey) {
      if (system.value.substring(s - 2, s) === "  ") {
        system.value = system.value.substring(0, s - 2) + system.value.substring(s);
        system.selectionStart = s - 2;
        system.selectionEnd = e - 2; } }
    else {
      system.value = system.value.substring(0, s) + '  ' + system.value.substring(e);
      system.selectionStart = system.selectionEnd = s + 2; }
    return false; }
  else if (i.key === "Enter" && i.ctrlKey) {
    i.preventDefault();
    reset();
    return false; }
  else return true; }
i.preventDefault();
if (i.ctrlKey) {
  if (i.key === "Enter") {
    reset();
    return false; }
  else return true; }
else if (i.metaKey || i.altKey) return true;
else {
  const handler = getKeyHandler[0];
  if (handler) {
    getKeyHandler.splice(0, 1);
    doIO(evaluate(app(handler, str(i.key))));
  };
  return false; } };