export function createChatMessage(text, userName, isMine = false) {
  return { id: crypto.randomUUID(), text, userName, isMine, createdAt: new Date().toISOString() };
}
