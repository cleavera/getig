import * as MarkdownIt from 'markdown-it';

const md: MarkdownIt = new MarkdownIt();

export function $parseMarkdown(raw: string): string {
    return md.render(raw);
}
