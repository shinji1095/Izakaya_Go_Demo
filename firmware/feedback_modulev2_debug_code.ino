#include <bluefruit.h>
#include <SPI.h>

const uint8_t SL = 4;
const uint8_t CLK = 10;
const uint8_t QH = 9;
const uint8_t btn9 = 7;
const uint8_t btn10 = 1;
const uint8_t FCK = 2;
const uint8_t allPin[] = {QH, btn9, btn10, FCK};
const uint8_t allPin_num = sizeof(allPin) / sizeof(allPin[0]);
const uint8_t SLdelay = 5;

uint8_t stateQH_val = 0;

enum ButtonID {
  Button1,
  Button2,
  Button3,
  Button4,
  Button5,
  Button6,
  Button7,
  Button8,
  Button9,
  Button10,
  Button11,
  Button12,
  Button13,
  Button14,
  Button15,
  Button16,
  ButtonNone
};

enum PressType {
  SinglePress,
  DoublePress,
  LongPress,
  NonePress
};

enum ButtonID new_btn = ButtonNone;
enum ButtonID old_btn = ButtonNone;
enum ButtonID last_btn = ButtonNone;
enum PressType prs = NonePress;

unsigned long pressedTime = 0;
unsigned long releasedTime = 0;
unsigned long lastClickTime = 0;
bool isPressed = false;
bool longPressTriggered = false;
uint8_t clickCount = 0;

// BLE
BLEService buttonService("19B10000-E8F2-537E-4F6C-D104768A1214");
BLECharacteristic buttonCharacteristic("19B10003-E8F2-537E-4F6C-D104768A1214", BLEWrite | BLENotify, 2);

// デバイス情報サービス
BLEDis bledis;

void setup() {
  Serial.begin(9600);

  SPI.begin();
  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE2));

  pinMode(SL, OUTPUT);
  digitalWrite(SL, LOW);
  pinMode(CLK, OUTPUT);
  digitalWrite(CLK, HIGH);

  for (uint8_t i = 0; i < allPin_num; i++) {
    pinMode(allPin[i], INPUT);
  }

  // BLEの初期化
  Bluefruit.begin();
  Bluefruit.setName("XIAO");
  Bluefruit.setTxPower(4); // 送信パワー（+4dBm）

  // デバイス情報サービスの設定
  bledis.setManufacturer("Adafruit Industries");
  bledis.setModel("XIAO");
  bledis.begin();

  // カスタムサービスとキャラクタリスティックの設定
  buttonService.begin();

  // ボタン押下時刻用キャラクタリスティック（通知可能）
  buttonCharacteristic.setProperties(CHR_PROPS_READ | CHR_PROPS_NOTIFY);
  buttonCharacteristic.setPermission(SECMODE_OPEN, SECMODE_OPEN);
  buttonCharacteristic.setFixedLen(2);
  buttonCharacteristic.begin();

  // アドバタイズ開始
  startAdv();

  Serial.println("BLE開始中...");
}

void loop() {
  digitalWrite(SL, LOW);
  delayMicroseconds(SLdelay);
  digitalWrite(SL, HIGH);
  delayMicroseconds(SLdelay);

  new_btn = getBtn();

  if (new_btn != ButtonNone) {
    last_btn = new_btn;
    if (!isPressed) {
      isPressed = true;
      pressedTime = millis();
      longPressTriggered = false;
    } else {
      if (!longPressTriggered && (millis() - pressedTime >= 400)) {
        prs = LongPress;
        longPressTriggered = true;
        if (new_btn == Button11) {
          sendBLEData(new_btn, prs);
          Serial.println("Long Press");
        } else if (new_btn != ButtonNone) {
          sendBLEData(new_btn, SinglePress);
          Serial.println("Single Press");
        }
      }
    }
  } else {
    if (isPressed) {
      isPressed = false;
      releasedTime = millis();

      if (!longPressTriggered) {
        if (clickCount == 0) {
          clickCount++;
          lastClickTime = releasedTime;
        } else if ((clickCount == 1 && (releasedTime - lastClickTime) <= 200) && last_btn == Button11) {
          prs = DoublePress;
          clickCount = 0;
          sendBLEData(last_btn, prs);
          Serial.println("Double Press");
        }
      }
    }
  }

  // シングルクリック判定
  if ((clickCount == 1 && (millis() - lastClickTime) > 200)) {
    prs = SinglePress;
    clickCount = 0;
    sendBLEData(last_btn, prs);
    Serial.println("Single Press");
  }

  old_btn = new_btn;
  delay(50);
}

void startAdv(void)
{  
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();
  Bluefruit.Advertising.addService(buttonService);
  Bluefruit.Advertising.addName();
  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(32, 244);
  Bluefruit.Advertising.setFastTimeout(30);
  Bluefruit.Advertising.start(0);
  Serial.println("BLEアドバタイズ開始");
}

enum ButtonID getBtn() {
  enum ButtonID push_btn = Button1;
  for (uint8_t i = 0; i < allPin_num; i++) {
    if (i == 0) {
      stateQH_val = readShiftRegister();
      for (uint8_t btn = Button1; btn < Button9; btn++) {
        if (((stateQH_val >> (7 - (btn - Button1))) & 1) == 0) {
          return static_cast<ButtonID>(btn);
        }
      }
    } else {
      uint8_t btn = Button9 + (i - 1);
      if (digitalRead(allPin[i]) == 0) {
        return static_cast<ButtonID>(btn);
      }
    }
  }
  return ButtonNone;
}

uint8_t readShiftRegister() {
  digitalWrite(CLK, LOW);
  digitalWrite(SL, HIGH);
  uint8_t val = SPI.transfer(0);
  digitalWrite(CLK, HIGH);
  digitalWrite(SL, LOW);
  return reverseBits(val);
}

uint8_t reverseBits(uint8_t b) {
  b = (b & 0xF0) >> 4 | (b & 0x0F) << 4;
  b = (b & 0xCC) >> 2 | (b & 0x33) << 2;
  b = (b & 0xAA) >> 1 | (b & 0x55) << 1;
  return b;
}


void sendBLEData(ButtonID buttonId, PressType pressType) {
  uint8_t data[2];
  data[0] = static_cast<uint8_t>(buttonId);
  data[1] = static_cast<uint8_t>(pressType);
  buttonCharacteristic.notify(data, sizeof(data));
  Serial.printf("Sent BLE: ButtonID=%d, PressType=%d\n", data[0], data[1]);
}
