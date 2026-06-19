// Helpers para generar sintaxis Markdown para diferentes tipos de contenido

export function insertYoutubeEmbed(url: string, title?: string): string {
  return `[${title || "Video de YouTube"}](${url})`;
}

export function insertGoogleDocsEmbed(
  documentId: string,
  title?: string
): string {
  const url = `https://docs.google.com/document/d/${documentId}/edit?usp=sharing`;
  return `[${title || "Google Doc"}](${url})`;
}

export function insertGoogleSheetsEmbed(
  sheetId: string,
  title?: string
): string {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`;
  return `[${title || "Google Sheet"}](${url})`;
}

export function insertGoogleSlidesEmbed(
  presentationId: string,
  title?: string
): string {
  const url = `https://docs.google.com/presentation/d/${presentationId}/edit?usp=sharing`;
  return `[${title || "Google Slides"}](${url})`;
}

export function insertPdfEmbed(
  url: string,
  title?: string
): string {
  return `[${title || "PDF"}](${url})`;
}

export function insertImageEmbed(
  url: string,
  altText?: string
): string {
  return `![${altText || "Imagen"}](${url})`;
}

export function insertCodeBlock(
  code: string,
  language: string = "text"
): string {
  return `\`\`\`${language}\n${code}\n\`\`\``;
}

export function insertQuote(text: string): string {
  const lines = text.split("\n").map((line) => `> ${line}`);
  return lines.join("\n");
}

export function insertTable(
  rows: number,
  cols: number
): string {
  const header = Array(cols)
    .fill(0)
    .map((_, i) => `Columna ${i + 1}`)
    .join(" | ");
  const separator = Array(cols).fill("---").join(" | ");
  const emptyRow = Array(cols).fill("").join(" | ");
  const body = Array(rows).fill(0).map(() => emptyRow).join("\n");
  return `| ${header} |\n| ${separator} |\n| ${body} |`;
}
