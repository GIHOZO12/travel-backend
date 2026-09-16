// Turns "Rwanda Wildlife Safari" into "rwanda-wildlife-safari" so we get
// clean, SEO-friendly URLs like /tours/rwanda-wildlife-safari (SRS §52).
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // strip anything that isn't a word char, space or hyphen
    .replace(/[\s_-]+/g, '-') // collapse spaces/underscores/hyphens into one hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

export default slugify;
