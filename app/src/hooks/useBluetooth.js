import { useState } from 'react';
import { mp3Map } from '../config/config';

export const useBluetooth = (addLog) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const scanDevices = async () => {
    try {
      addLog('デバイスをスキャン中...');
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'],
      });
      setDevices((prev) => [...new Set([...prev, device.name])]);
      addLog(`デバイス発見: ${device.name}`);
    } catch (error) {
      addLog(`スキャンエラー: ${error.message}`);
    }
  };

  const connectToDevice = async () => {
    if (!selectedDevice) {
      addLog('デバイスを選択してください');
      return;
    }
    setIsConnecting(true);
    try {
      addLog(`接続中: ${selectedDevice}`);
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: selectedDevice }],
        optionalServices: ['battery_service'],
      });
      const server = await device.gatt.connect();
      addLog('デバイスに接続しました');

      // 仮のコマンド受信シミュレーション
      setTimeout(() => {
        const command = 'play_song_1';
        addLog(`コマンド受信: ${command}`);
        handleCommand(command);
      }, 2000);
    } catch (error) {
      addLog(`接続エラー: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCommand = (command) => {
    const audio = new Audio();
    const mp3Url = mp3Map[command] || null;
    if (mp3Url) {
      audio.src = mp3Url;
      audio.play().then(() => {
        addLog(`再生中: ${mp3Url}`);
      }).catch((error) => {
        addLog(`再生エラー: ${error.message}`);
      });
    } else {
      addLog('不明なコマンド');
    }
  };

  return {
    devices,
    selectedDevice,
    setSelectedDevice,
    isConnecting,
    scanDevices,
    connectToDevice,
  };
};