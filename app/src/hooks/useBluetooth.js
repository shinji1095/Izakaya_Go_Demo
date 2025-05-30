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
        if (value.byteLength !== 2) {
          addLog(`不正な通知データ長: ${value.byteLength}バイト`);
          return;
        }

        const buttonId = value.getUint8(0);
        const pressType = value.getUint8(1);

        if (buttonId <= 16) {
          addLog(`受信: Button${buttonId + 1}, PressType=${pressType}`);
          handleCommand(buttonId, pressType);
        } else {
          addLog(`無効なButtonID: ${buttonId}`);
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

  const voices = speechSynthesis.getVoices();
  const japaneseVoices = voices.filter(v => v.lang === 'ja-JP');

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 1.0;
  utterance.volume = 1.0;
  utterance.pitch = 2.0;

  if (japaneseVoices.length > 0) {
    utterance.voice = japaneseVoices[0]; // または好みに応じてインデックスを変える
    addLog(`使用する声: ${utterance.voice.name}`);
  } else {
    addLog('日本語の音声が見つかりません');
  }

  speechSynthesis.speak(utterance);
  addLog(`TTS読み上げ: ${text}`);
};


  const handleCommand = (buttonId, pressType) => {
    if (buttonId > 16) {
      addLog(`無効なButtonID: ${buttonId + 1}`);
      return;
    }

    const prevButtonId = prevIdRef.current;
    if (buttonId === 10 && pressType ===  PressType.SinglePress){
      const buttonState = buttonStates[prevButtonId];
      addLog(`prevButtonIdRef=${prevButtonId}`);

      if (prevButtonId === null){
        return;
      }
      if (buttonState === undefined){
        return;
      }

      buttonState.decPressCount(); // TODO 理由が分からない...
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

    if (prevButtonId !== buttonId) {
      addLog(`Prev button ID=${prevButtonId}, buttonId=${buttonId}`);
      if (prevButtonId !== null && prevButtonId < buttonStates.length) {
        buttonStates[prevButtonId].resetPressCount();
      }
    }
    prevIdRef.current = buttonId;

    if (buttonId === 10) { 
      if (pressType === PressType.DoublePress) {
        lettersRef.current = lettersRef.current.slice(0, -1);
        addLog(`文字削除: 現在のletters=${letters.slice(0, -1)}`);
        speakText(lettersRef.current);
        return;
      }
      if (pressType === PressType.LongPress) {
        speakText(`${lettersRef.current}　　　を検索します`);
        lettersRef.current = '';
        return;
      }
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