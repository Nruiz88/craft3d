export async function getAllProducts() { return []; }
export async function getProductBySlug(slug: string) { return null; }
export async function getProductById(id: string) { return null; }
export async function decrementProductStock(slug: string) { return { ok: true }; }
export async function createProduct(data: any) { return { data: null, error: null }; }
export async function deleteProduct(id: string) { return { error: null }; }
export async function updateProduct(id: string, data: any) { return { data: null, error: null }; }
export async function setProductFeatured(id: string, v: boolean) { return { ok: true }; }
export async function setProductStock(id: string, v: number) { return { ok: true }; }
export async function slugExists(slug: string) { return false; }
export async function validateProductInput(d: any) { return { ok: true }; }
