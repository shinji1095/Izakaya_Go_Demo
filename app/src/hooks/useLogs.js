import { useState } from 'react';
import { formatLog } from '../utils/formatLog';

export const useLogs = () => {
  const [logs, setLogs] = useState('');

  const addLog = (message) => {
    setLogs((prev) => prev + formatLog(message) + '\n');
  };

  return { logs, addLog };
};