export async function getEditablePages() { return []; }
export async function saveEditablePage(data: any) { return { ok: true }; }
export async function deleteEditablePage(slug: string) { return { ok: true }; }
export async function getEditablePage(slug: string) { return null; }
export type EditablePage = any;
export type PageSection = any;
