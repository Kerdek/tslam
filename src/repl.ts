import { repl } from './webrepl.js'
import { highlight_html, read_expression, read_group } from './read.js'
import { tokens } from './tokens.js'
import { application, app } from './application.js'
import { readuni, readref } from './universal.js'
import { read_text } from './text.js'
import { reduce } from './reduce.js'
import { Term } from './term.js'

let state = null as unknown as Term;
let apply = null as unknown as (e: Term) => void;
let ps1 = null as unknown as HTMLElement;

const greeting = document.createElement('span');
greeting.className = 'hlquant';
greeting.innerText = 'The machine state is printed between each command. \
When you enter a command, the machine state is applied. \
The result is the new machine state. \
The syntax is like untyped lambda calculus. Press Ctrl+Enter to reset.';

const superps1 = document.createElement('span');
superps1.className = 'ps1';
superps1.innerText = '#';

const userps1 = document.createElement('span');
userps1.className = 'ps1';
userps1.innerText = '$';

const reset = async (print: (e: HTMLElement) => HTMLElement) => {
state = null as unknown as Term;
ps1 = superps1;
print(greeting);
apply = e => {
  state = e;
  ps1 = userps1;
  apply = e => {
    state = application[app](state, e); } }
return ps1; }

const exec = async (t: string, print: (e: HTMLElement) => HTMLElement) => {
const e = read_expression(expression => tokens => {
  const q = [readuni, read_group, readref, read_text].map(f => f(expression)(tokens));
  return () => {
    for (const j of q) {
      if (!j) return null;
      const e = j();
      if (e) return e; }
    return null; } })(tokens(t))();
if (!e) {
  const err = print(document.createElement('span'));
  err.innerText = 'parse error';
  return ps1; }
apply(e);
for (;;) {
  const next = reduce(state);
  if (!next) return ps1;
  else state = next; } }

const console = document.body.appendChild(repl(text => highlight_html(tokens(text)) || '', reset, exec));
console.setAttribute('style', 'position:absolute;top:0;bottom:50%;left:0;right:0;')
console.tabIndex = 0;
console.focus();

const output = document.body.appendChild(document.createElement('div'));
output.setAttribute('style', 'position:absolute;top:50%;bottom:0;left:0;right:0;');
output.tabIndex = 1;