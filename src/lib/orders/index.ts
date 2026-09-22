export async function getOrders() { return []; }
export async function createOrder(data: any) { return { data: null, error: null }; }
export async function getOrderById(id: string) { return null; }
export async function updateOrderStatus(id: string, status: string) { return { ok: true }; }
export async function updateOrderItems(id: string, items: any) { return { ok: true }; }
export async function getOrdersByUserId(userId: string) { return []; }
export async function markOrderPaid(id: string) { return { ok: true }; }
export async function markReservationDepositPaid(id: string) { return { ok: true }; }
