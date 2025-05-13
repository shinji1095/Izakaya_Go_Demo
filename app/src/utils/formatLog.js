export const formatLog = (message) => {
  const timestamp = new Date().toLocaleTimeString();
  return `[${timestamp}] ${message}`;
};