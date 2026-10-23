import { C } from "../constants/theme.js";

export async function exportPNG(root, login) {
  // Loaded on first use so the image renderer stays out of the main bundle.
  const { toPng } = await import("html-to-image");
  // `exporting` hides the controls and the terminal log (the `noPrint`
  // elements) so the image is sized to what is left, as in the PDF.
  root.classList.add("exporting");
  let url;
  try {
    await new Promise(requestAnimationFrame);
    url = await toPng(root, { backgroundColor: C.bg, pixelRatio: 2 });
  } finally {
    root.classList.remove("exporting");
  }
  const link = document.createElement("a");
  link.download = `github-dashboard-${login}.png`;
  link.href = url;
  link.click();
}

// PDF goes through the browser's print dialog ("Save as PDF"); the print
// stylesheet in index.css hides the controls and keeps the dark colours.
export function exportPDF() {
  window.print();
}
