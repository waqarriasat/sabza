'use client';
// Injects raw SVG markup while staying out of the layout box (display:contents),
// so descendant CSS selectors like `.x svg { ... }` keep working exactly as before.
export default function Raw({ html, className, style }) {
  return (
    <span
      className={className}
      style={{ display: 'contents', ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
