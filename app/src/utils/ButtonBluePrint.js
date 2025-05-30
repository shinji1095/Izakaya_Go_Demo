export const BUTTON_STATE = Object.freeze({
  KANA: 0,
  ALPHABET: 1,
  NUMBER: 2,
});

export class ButtonStateBluePrint {
  constructor(
    hiragana,
    haveVoicedSound,
    voicedSounds,
    haveSemiVoicedSound,
    semiVoicedSounds,
    haveSmallHiragana,
    smallHiragana,
    smallLetters,
    numbers
  ) {
    this.hiragana = [hiragana];
    this.haveSmallHiragana = haveSmallHiragana;
    this.smallHiragana = smallHiragana;
    this.haveVoicedSound = haveVoicedSound;
    this.voicedSounds = voicedSounds;
    this.haveSemiVoicedSound = haveSemiVoicedSound;
    this.semiVoicedSounds = semiVoicedSounds;
    this.smallLetters = smallLetters;
    this.numbers = numbers;
    this.state = BUTTON_STATE.KANA; // KANA: 0, ALPHABET: 1, NUMBER: 2
    this.stateNum = 3;
    this.kanaState = 0; // Normal: 0, Voiced Sound: 1, Semi-Voiced Sound: 2, Small: 3
    this.pressCount = 0; // ボタンが押された回数

    // KANA
    this.assignedLetters = [[hiragana], [smallLetters], [numbers]];
    if (haveVoicedSound) {
      this.assignedLetters[BUTTON_STATE.KANA].push(voicedSounds);
    }
    if (haveSemiVoicedSound) {
      this.assignedLetters[BUTTON_STATE.KANA].push(semiVoicedSounds);
    }
    if (haveSmallHiragana) {
      this.assignedLetters[BUTTON_STATE.KANA].push(smallHiragana);
    }
    this.kanaStateNum = this.assignedLetters[BUTTON_STATE.KANA].length;
  }

  nextState() {
    this.state = (this.state + 1) % this.stateNum;
  }

  nextKanaState() {
    this.kanaState = (this.kanaState + 1) % this.kanaStateNum;
  }

  resetPressCount() {
    this.pressCount = 0;
  }

  addPressCount() {
    this.pressCount += 1;
  }

  decPressCount() {
    this.pressCount -= 1;
  }

  getLetter(){
    let letter;
    switch (this.state) {
      // TODO: 濁音，半濁音，小文字は未実装
      case BUTTON_STATE.KANA:
        const kanaLetters = this.assignedLetters[BUTTON_STATE.KANA][this.kanaState];
        letter = kanaLetters[this.pressCount % kanaLetters.length];
        break;
      case BUTTON_STATE.ALPHABET:
        const alphabetLetters = this.assignedLetters[BUTTON_STATE.ALPHABET][0];
        letter = alphabetLetters[this.pressCount % alphabetLetters.length];
        break;
      case BUTTON_STATE.NUMBER:
        const numberLetters = this.assignedLetters[BUTTON_STATE.NUMBER][0];
        letter = numberLetters[this.pressCount % numberLetters.length];
        break;
      default:
        console.error('Invalid state');
        return '';
    }
    return letter;
  }

  getMp3Path() {
    let letter = this.getLetter();
    return `/mp3/${letter}.mp3`;
  }
}