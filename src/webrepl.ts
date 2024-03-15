export const repl = (
  highlight: (text: string) => string,
  reset: (print: (e: HTMLElement) => HTMLElement) => Promise<HTMLElement>,
  exec: (text: string, print: (e: HTMLElement) => HTMLElement) => Promise<HTMLElement>) => {

// CONTENT

const all = document.createElement('div');

const content = all.appendChild(document.createElement('div'));
content.setAttribute('style',
'position:absolute;\
left:0;right:0;bottom:0;\
max-height:100%;\
overflow-y:auto;\
overflow-wrap:anywhere;\
word-break:break-all;\
white-space:pre-wrap');

const scrollback = document.createElement('div');
content.append(scrollback);

const prompt = content.appendChild(document.createElement('div'));
prompt.setAttribute('style', 'position:relative;overflow:hidden;')

const prompt_hind = prompt.appendChild(document.createElement('div'));
prompt_hind.setAttribute('style', 'z-index:0;');

const prompt_fore = prompt.appendChild(document.createElement('div'));
prompt_fore.setAttribute('style',
'z-index:1;position:absolute;top:0;left:0;\
background:transparent;color:transparent;');

const ps1_hind = prompt_hind.appendChild(document.createElement('span'));
const ps1_fore = prompt_fore.appendChild(document.createElement('span'));

const input_hind = prompt_hind.appendChild(document.createElement('span'));
const input_fore = prompt_fore.appendChild(document.createElement('span'));
input_fore.toggleAttribute('contenteditable');
input_fore.setAttribute('spellcheck', 'false');

// BEHAVIOR

const repl_reset = async () => {
scrollback.innerHTML = '';
const disp = prompt.style.display;
prompt.style.display = 'none';
const out = scrollback.appendChild(document.createElement('div'));
const ps1 = await reset(e => {
  const l = out.appendChild(e);
  autoscroll();
  return l; });
input_fore.innerHTML = input_hind.innerHTML = '';
ps1_hind.replaceChildren(ps1.cloneNode(true));
ps1_fore.replaceChildren(ps1.cloneNode(true));
prompt.style.display = disp; };

const repl_text = () =>
input_fore.innerHTML.replace(/<br\/?>/g, '\n');

const autoscroll = () => {
content.scrollTo(0, content.scrollHeight); }

// EVENTS

input_fore.onkeydown = e => {
if (e.key === 'Enter' && !e.shiftKey) return false;
else return true; }

input_fore.oninput = () => {
input_hind.innerHTML = highlight(repl_text());
return true; };

all.oncopy = e => {
const o = document.getSelection() as Selection;
const r = o.getRangeAt(0);
e.clipboardData?.clearData();
if (!r || r.endContainer != r.startContainer || r.startContainer != input_fore.childNodes[0]) {
  return true; }
else {
  const n = r.startContainer;
  const txt = (n.nodeValue || '').slice(r.startOffset, r.endOffset - r.startOffset);
  e.clipboardData?.setData('text/plain', txt);
  e.clipboardData?.setData('text/html', highlight(txt));
  return false; } }

all.onpaste = e => {
const c = e.clipboardData?.getData('text/plain');
if (!c) return false;
const s = repl_text();
const o = document.getSelection() as Selection;
const r = o.getRangeAt(0);
if (!r || r.endContainer != r.startContainer || r.startContainer != input_fore.childNodes[0]) {
  const t = s + c;
  if (!t) return false;
  input_fore.innerHTML = '';
  const b = input_fore.appendChild(document.createTextNode(t));
  r.setStart(b, t.length);
  r.setEnd(b, t.length); }
else {
  const t = s.substring(0, r.startOffset) + c;
  if (!t) return false;
  input_fore.innerHTML = '';
  const b = input_fore.appendChild(document.createTextNode(t + s.substring(r.endOffset, s.length)));
  r.setStart(b, t.length);
  r.setEnd(b, t.length); }
input_hind.innerHTML = highlight(repl_text());
return false; }

input_fore.onpaste = null;
input_fore.oncopy = null;

all.onkeydown = async e => {
if (e.key === 'Tab') return true;
else if (e.ctrlKey) {
  if (e.key === 'Enter') {
    await repl_reset();
    return false; }
  else if (e.key == 'a') {
    input_fore.focus();
    return true; }
  else return true; }
else if (e.altKey || e.metaKey){
  return true; }
else if (e.key === 'Enter' && !e.shiftKey) {
  scrollback.appendChild(prompt_hind.cloneNode(true));
  const disp = prompt.style.display;
  prompt.style.display = 'none';
  const out = scrollback.appendChild(document.createElement('div'));
  const ps1 = await exec(repl_text(), e => {
    const l = out.appendChild(e);
    autoscroll();
    return l; });
  input_fore.innerHTML = input_hind.innerHTML = '';
  ps1_hind.replaceChildren(ps1.cloneNode(true));
  ps1_fore.replaceChildren(ps1.cloneNode(true));
  prompt.style.display = disp;
  autoscroll();
  return false; }
else if (e.key != 'Shift') {
  input_fore.focus();
  return true; }
else return true; };

repl_reset();

return all; }