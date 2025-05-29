import { useLogs } from './hooks/useLogs';
import { useBluetooth } from './hooks/useBluetooth';
import { Select } from './components/Select';
import { TextArea } from './components/TextArea';
import { Button } from './components/Button';
import './styles.css';

export default function App() {
  const { logs, addLog } = useLogs();
  const {
    devices,
    selectedDevice,
    setSelectedDevice,
    isConnecting,
    isConnected,
    buttonLabel,
    scanDevices,
    connectToDevice,
    disconnectDevice,
  } = useBluetooth(addLog);

  const handleButtonClick = () => {
    if (isConnected) {
      disconnectDevice();
    } else {
      connectToDevice();
    }
  };

  return (
    <div className="app-container">
      <Select
        label="Bluetoothデバイス"
        value={selectedDevice}
        onChange={(e) => setSelectedDevice(e

.target.value)}
        onClick={scanDevices}
        options={devices}
        placeholder="デバイスを選択"
      />
      <TextArea label="ログ" value={logs} readOnly />
      <Button
        label={isConnecting ? '接続中...' : buttonLabel}
        onClick={handleButtonClick}
        disabled={isConnecting}
      />
    </div>
  );
}