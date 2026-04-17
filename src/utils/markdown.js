import { marked } from "marked";
import DOMPurify from "dompurify";

export const htmlToMarkdown = (html) => {
	if (!html) return "";
	let text = html;
	// Convert headings
	text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
	text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
	text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
	// Convert formatting
	text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
	text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
	text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
	text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
	text = text.replace(/<u[^>]*>(.*?)<\/u>/gi, "$1");
	// Convert lists
	text = text.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
		return (
			content.replace(/<li[^>]*>(.*?)<\/li>/gi, (m, c) => `- ${c.trim()}\n`) +
			"\n"
		);
	});
	text = text.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
		let i = 1;
		return (
			content.replace(
				/<li[^>]*>(.*?)<\/li>/gi,
				(m, c) => `${i++}. ${c.trim()}\n`,
			) + "\n"
		);
	});
	// Convert paragraphs and line breaks
	text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
	text = text.replace(/<br\s*\/?>/gi, "\n");
	// Strip remaining tags
	text = text.replace(/<[^>]+>/g, "");
	// Cleanup whitespace
	return text.replace(/\n{3,}/g, "\n\n").trim();
};

export const markdownToHtml = (markdown) => {
	if (!markdown) return "";
	// Ensure markdown is a string and handle potential literal \n
	const cleanMarkdown = String(markdown).replace(/\\n/g, "\n");

	marked.setOptions({
		gfm: true,
		breaks: true,
	});

	const html = marked.parse(cleanMarkdown, { async: false });
	/*
	 * Post-process for Quill compatibility: Remove <p> tags inside <li> to prevent list rendering issues in Quill
	 * Use a more robust regex that handles potential attributes on li/p
	 */
	const flattenedHtml = html.replace(
		/<li[^>]*>\s*<p[^>]*>(.*?)<\/p>\s*<\/li>/gis,
		"<li>$1</li>",
	);

	return DOMPurify.sanitize(flattenedHtml, {
		ADD_TAGS: ["iframe", "u", "pre", "code"],
		ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
	});
};

export const renderMarkdown = (text) => {
	if (!text) return "";
	return DOMPurify.sanitize(marked.parse(text, { async: false }));
};
