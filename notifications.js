export function addNotification(title, body) {
  const item = { id: crypto.randomUUID(), title, body, createdAt: new Date().toISOString() };
  return item;
}
