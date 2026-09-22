export function useCart() { return { items: [], addItem: () => {}, removeItem: () => {}, clearCart: () => {} }; }
export function CartProvider({ children }: { children: React.ReactNode }) { return <>{children}</>; }
