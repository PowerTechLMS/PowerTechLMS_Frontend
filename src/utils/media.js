export function getFullMediaUrl(url) {
	if (!url) return "";
	if (url.startsWith("http")) return url;

	const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:1000000";
	return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}
