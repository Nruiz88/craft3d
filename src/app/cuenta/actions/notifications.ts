export interface Notification {
  id: string;
  title: string;
  read: boolean;
  createdAt: string;
}

export function getNotifications(): Notification[] {
  return [];
}
export function getUnreadCount(): number {
  return 0;
}
export function markAsRead(id: string): void {}
export function markAllAsRead(): void {}
