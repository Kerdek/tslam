export const unmess_svg = (img: SVGSVGElement): void => {
const backdrop = img.querySelector('polygon');
backdrop?.parentNode?.removeChild(backdrop);
img.querySelectorAll('title').forEach(x => x.parentNode?.removeChild(x));
img.querySelectorAll('*').forEach(x => {
  x.removeAttribute('id');
  x.removeAttribute('font-family');
  x.removeAttribute('font-size');
  x.removeAttribute('fill');
  x.removeAttribute('stroke'); });
const { width, height } = img.viewBox.baseVal;
img.setAttribute('width', `${width}`);
img.setAttribute('height', `${height}`); }