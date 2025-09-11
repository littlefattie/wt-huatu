import katex from "katex";
import "katex/contrib/mhchem";

export const renderKatexInline = (math: string): string => {
  try {
    return katex.renderToString(math, {
      displayMode: false,
      output: "html",
    });
  } catch (error) {
    return `<span class='txt-error'>公式书写错误: ${math}</span>`;
  }
};

export const renderKatexBlock = (math: string): string => {
  try {
    const katexHtml = katex.renderToString(math, {
      displayMode: true,
      output: "html",
    });
    return `<div class="katex-block">${katexHtml}</div>`;
  } catch (error) {
    return `<span class='txt-error'>公式书写错误: ${math}</span>`;
  }
};

export const renderKatexInlineWithBlockForm = (math: string): string => {
  try {
    const renderedHtml = katex.renderToString(math, {
      displayMode: true,
      output: "html",
    });
    const matched = /<span class="katex-display">([\s\S]+)<\/span>/i.exec(renderedHtml);
    return matched ? matched[1] : renderedHtml;
  } catch (error) {
    return `<span class='txt-error'>公式书写错误: ${math}</span>`;
  }
};

export const renderKatexMixedText = (text: string): string => {
  const rawSegments = text.split(/(?<!\\)\$/); // Split label text with just the $ sign, but not escaped one \$
  const rendered:string[] = [];
  if (rawSegments[0].trim()) {
    rendered.push(`<span>${rawSegments[0]}</span>`);
  }
  let dsStarted = false;
  let textPending = '';
  if (rawSegments.length >= 2) {
    for (let i = 1; i < rawSegments.length; i++) {
      if (!dsStarted) {
        dsStarted = true;
        if (textPending.trim()) {
          rendered.push(`<span>${textPending}</span>`);
        }
        textPending = rawSegments[i];
      } else {
        rendered.push(renderKatexInlineWithBlockForm(textPending));
        dsStarted = false;
        textPending = rawSegments[i];
      }
    }
    if (dsStarted) {
      textPending = '$' + textPending;
    }
    if (textPending) {
      rendered.push(`<span>${textPending}</span>`);
    }
  }
  return rendered.join("");
}

export const renderKatexMixedTextConditional = (text: string, renderKatex?: boolean) => {
  return renderKatex
    ? renderKatexMixedText(text)
    : `<span>${text}</span>`;
};
