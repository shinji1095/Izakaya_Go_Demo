/*********************************************************************
 This is an example for our nRF52 based Bluefruit LE modules

 Pick one up today in the adafruit shop!

 Adafruit invests time and resources providing this open source code,
 please support Adafruit and open-source hardware by purchasing
 products from Adafruit!

 MIT license, check LICENSE for more information
 All text above, and the splash screen below must be included in
 any redistribution
*********************************************************************/
#include <bluefruit.h>
#include <stdint.h>

enum TapType {
    SingleTap,
    DoubleTap,
    LongPress
};

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
  ButtonEmpty
};

const uint8_t charBtn_num = 3;
const uint8_t btn_num = charBtn_num + 1;
uint8_t pin_num[btn_num];
uint8_t state[btn_num];
uint8_t state_num[btn_num];
uint8_t flag = 0;
char *string[256];
uint8_t n = 0;
const char *moji[10][5] = {{"あ", "い", "う", "え", "お"}, 
                           {"か", "き", "く", "け", "こ"}, 
                           {"さ", "し", "す", "せ", "そ"}, 
                           {"た", "ち", "つ", "て", "と"}, 
                           {"な", "に", "ぬ", "ね", "の"}, 
                           {"は", "ひ", "ふ", "へ", "ほ"}, 
                           {"ま", "み", "む", "め", "も"}, 
                           {"や", "ゆ", "よ", "", ""}, 
                           {"ら", "り", "る", "れ", "ろ"}, 
                           {"わ", "を", "ん", "", ""}};

// BLEサービスとキャラクタリスティックの定義
BLEService feedbackService = BLEService("19B10000-E8F2-537E-4F6C-D104768A1214");
BLECharacteristic buttonPressChar = BLECharacteristic("19B10003-E8F2-537E-4F6C-D104768A1214");

// デバイス情報サービス
BLEDis bledis;

// モータとボタンのピン
constexpr int BUTTON = 4; // GPIO 4 (D4)
int lastButtonState = HIGH; // 内部プルアップで初期状態はHIGH

void setup() 
{
  // GPIOの初期化
  // 文字盤の初期化
  memset(state, 0, sizeof(state));
  memset(state_num, 0, sizeof(state_num));

  for (uint8_t i = 0; i < btn_num; i++) {
    pin_num[i] = i;
    pinMode(pin_num[i], INPUT); // INPUT_PULLUP
  }

  // シリアル通信（デバッグ用）
  Serial.begin(115200);
  while (!Serial) delay(10);

  Serial.println("Bluefruit52 Motor Control and Button Example");
  Serial.println("--------------------------------\n");

  Serial.println("Go to your phone's Bluetooth settings to pair your device");
  Serial.println("Send '1' to turn on the motor, '0' to turn off.");
  Serial.println("Button press times will be sent via BLE.");

  // BLEの初期化
  Bluefruit.begin();
  Bluefruit.setTxPower(4); // 送信パワー（+4dBm）

  // デバイス情報サービスの設定
  bledis.setManufacturer("Adafruit Industries");
  bledis.setModel("XIAO nRF52840");
  bledis.begin();

  // カスタムサービスとキャラクタリスティックの設定
  feedbackService.begin();

  // ボタン押下時刻用キャラクタリスティック（通知可能）
  buttonPressChar.setProperties(CHR_PROPS_READ | CHR_PROPS_NOTIFY);
  buttonPressChar.setPermission(SECMODE_OPEN, SECMODE_OPEN);
  buttonPressChar.setFixedLen(4); // 4バイト（uint32_tの時刻）
  buttonPressChar.begin();

  // アドバタイズ開始
  startAdv();
}

void startAdv(void)
{  
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();
  Bluefruit.Advertising.addService(feedbackService);
  Bluefruit.Advertising.addName();
  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(32, 244);
  Bluefruit.Advertising.setFastTimeout(30);
  Bluefruit.Advertising.start(0);
  Serial.println("BLEアドバタイズ開始");
}

void loop() {
  flag = read_char(pin_num, state, state_num);
  if (flag = 1) {
    string[n] = getMoji(state);
    n++;
  }
  decisionOrSendOrClear(pin_num, state, state_num, string);

  // // ボタンの状態を読み取り
  // int buttonState = digitalRead(BUTTON);
  
  // // ボタンが押された瞬間（HIGH→LOW）を検知
  // if (buttonState == LOW && lastButtonState == HIGH) {
  //   // 押下時刻（millis()）を取得
  //   uint32_t pressTime = millis();
  //   Serial.print("Button pressed at: ");
  //   Serial.println(pressTime);

  //   // BLEで通知（接続中の場合のみ）
  //   if (Bluefruit.connected() && buttonPressChar.notifyEnabled()) {
  //     buttonPressChar.notify32(pressTime);
  //   }
  // }
  // lastButtonState = buttonState;

  delay(100); // デバウンス用
}

uint_t read_char(uint8_t pin_num[], uint_t state[], uint_t state_num[]) {
  for (uint8_t i = 0; i < charBtn_num; i++) {
    state[i] = digitalRead(pin_num[i]);

    if (state[i] != 0) {
      for (uint8_t j = 0; j < charBtn_num; j++) {
        if (i == j) {
          state_num[j]++;
        }
        else {
          state_num[j] = 0;
        }
      }
      flag = 1;
    }
    else {
      flag = 0;
    }
  }
  else {
    flag = 0;
  }
  return flag;
}

const char* getMoji(uint8_t state_num[]) {
  for (uint8_t i = 0; i < charBtn_num; i++) {
    if (state_num[i] != 0) {
      const char chr = moji[i][state_num[i]];
    }
  }
  return chr;
}

void decisionOrSendOrClear(uint8_t pin_num[], uint_t state[], uint_t state_num[], const char string[]) {
  state[btn_num] = digitalRead(pin_num[btn_num]);
  if (state[btn_num] != 0) {
    state_num[btn_num]++;
    if (state_num[btn_num] > 10) {
      Serial.println("%s\n", string);
      state_num[btn_num] = 0;
    }
  }
}