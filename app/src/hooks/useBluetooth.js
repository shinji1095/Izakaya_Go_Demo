import { useState, useEffect, useRef } from 'react';
import { bluetoothConfig } from '../config/config';
import {
  ButtonState1,
  ButtonState2,
  ButtonState3,
  ButtonState4,
  ButtonState5,
  ButtonState6,
  ButtonState7,
  ButtonState8,
  ButtonState9,
  ButtonState10,
} from '../utils/ButtonStates';

// ボタン押しタイプ
const PressType = Object.freeze({
  SinglePress: 0,
  DoublePress: 1,
  LongPress: 2,
});

export const useBluetooth = (addLog) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [letters, setLetters] = useState('');
  const lettersRef = useRef('');
  const prevIdRef = useRef(null);
  const deviceRef = useRef(null);
  const serverRef = useRef(null);
  const characteristicRef = useRef(null);

  // ButtonState インスタンスのマッピング
  const buttonStates = [
    ButtonState1,
    ButtonState2,
    ButtonState3,
    ButtonState4,
    ButtonState5,
    ButtonState6,
    ButtonState7,
    ButtonState8,
    ButtonState9,
    ButtonState10,
  ];

  const scanDevices = async () => {
    try {
      addLog('デバイスをスキャン中...');
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [bluetoothConfig.serviceUUID],
      });
      setDevices([device.name]);
      setSelectedDevice(device.name);
      addLog(`デバイス発見: ${device.name}`);
      deviceRef.current = device;
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
        acceptAllDevices: true,
        optionalServices: [bluetoothConfig.serviceUUID],
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(bluetoothConfig.serviceUUID);
      const characteristic = await service.getCharacteristic(bluetoothConfig.characteristicUUID);

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        const length = value.byteLength;

        for (let i = 0; i + 1 < length; i += 2) {
          const buttonId = value.getUint8(i);     // ButtonID
          const pressType = value.getUint8(i + 1); // PressType

          if (buttonId <= 16){
            addLog(`受信: Button${buttonId + 1}, PressType=${pressType}`);
            handleCommand(buttonId, pressType);
          }
        }
      });

      serverRef.current = server;
      deviceRef.current = device;
      characteristicRef.current = characteristic;
      setIsConnected(true);
      addLog('デバイスに接続しました');
      addLog(`接続デバイス名: ${device.name}`);
    } catch (error) {
      addLog(`接続エラー: ${error.message}`);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };


  const disconnectDevice = () => {
    if (serverRef.current) {
      serverRef.current.disconnect();
      serverRef.current = null;
      deviceRef.current = null;
      characteristicRef.current = null;
      setIsConnected(false);
      setLetters('');
      buttonStates.forEach((state) => state.resetPressCount());
      addLog('デバイスを切断しました');
    }
  };

  const speakText = (text) => {
    if (!text) {
      addLog('読み上げる文字がありません');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 1.0; // 読み上げ速度
    utterance.volume = 1.0; // 音量
    speechSynthesis.speak(utterance);
    addLog(`TTS読み上げ: ${text}`);
  };

  const handleCommand = (buttonId, pressType) => {
    if (buttonId > 16) {
      addLog(`無効なButtonID: ${buttonId + 1}`);
      return;
    }

    if (buttonId === 10 && pressType ===  PressType.SinglePress){
      const buttonState = buttonStates[prevIdRef.current];
      buttonState.decPressCount(); // TODO 理由が分からない...
      addLog(`prevIdRef=${prevIdRef.current}`);
      const mp3Url = buttonState.getMp3Path();
      addLog(`pressCount=${buttonState.pressCount}`);
      const letter = mp3Url.replace('/mp3/', '').replace('.mp3', '');
      if (letter === 'undefined'){
        return;
      }
      lettersRef.current = lettersRef.current + letter;
      addLog(`現在のletters=${lettersRef.current}`);
      speakText(lettersRef.current);
      buttonStates.forEach((state) => state.resetPressCount());
      return;
    }

    if (prevIdRef.current !== buttonId) {
      addLog(`Prev button ID=${prevIdRef.current}, buttonId=${buttonId}`);
      if (prevIdRef.current !== null && prevIdRef.current < buttonStates.length) {
        buttonStates[prevIdRef.current].resetPressCount();
      }
    }
    prevIdRef.current = buttonId;

    if (buttonId === 10) { 
      if (pressType === PressType.DoublePress) {
        lettersRef.current = lettersRef.current.slice(0, -1);
        addLog(`文字削除: 現在のletters=${letters.slice(0, -1)}`);
        return;
      }
      if (pressType === PressType.LongPress) {
        speakText(lettersRef.current);
        return;
      }
    }

    if (pressType !== PressType.SinglePress) {
      addLog(`無視: Button${buttonId + 1}, PressType=${pressType}`);
      return;
    }

    // Button1からButton10のSinglePress処理
    const buttonState = buttonStates[buttonId];
    const mp3Url = buttonState.getMp3Path();
    if (mp3Url) {
      const letter = mp3Url.replace('/mp3/', '').replace('.mp3', '');
      const audio = new Audio(mp3Url);
      addLog(`pressCount=${buttonState.pressCount}`);
      audio.play()
        .then(() => {
          addLog(`再生中: ${mp3Url}`);
          setLetters((prev) => prev + letter); // 文字を追加
          addLog(`文字追加: ${letter}, 現在のletters=${letter}`);
        })
        .catch((error) => {
          addLog(`再生エラー: ${error.message}`);
        });
    } else {
      addLog('MP3パスが無効');
    }
    buttonState.addPressCount();
  };

  useEffect(() => {
    return () => {
      if (serverRef.current) {
        serverRef.current.disconnect();
      }
    };
  }, []);

  return {
    devices,
    selectedDevice,
    setSelectedDevice,
    isConnecting,
    isConnected,
    buttonLabel: isConnected ? '切断' : '接続',
    scanDevices,
    connectToDevice,
    disconnectDevice,
  };
};