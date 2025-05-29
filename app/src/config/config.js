const hiraganaLists = [["あ", "い", "う", "え", "お",],
                      ["か", "き", "く", "け", "こ",],
                      ["さ", "し", "す", "せ", "そ",],
                      ["た", "ち", "つ", "て", "と",],
                      ["な", "に", "ぬ", "ね", "の",],
                      ["は", "ひ", "ふ", "へ", "ほ",],
                      ["ま", "み", "む", "め", "も",],
                      ["や", "ゆ", "よ",],
                      ["ら", "り", "る", "れ", "ろ",],
                      ["わ", "を", "ん"]]

export const mp3FilesMap = hiraganaLists.map(hiragana => hiragana.map(h => `/mp3/${h}.mp3`))

export const bluetoothConfig = {
  deviceFilter: {
    name: 'XIAO', 
  },
  optionalServices: ['19b10000-e8f2-537e-4f6c-d104768a1214'],
  serviceUUID: '19b10000-e8f2-537e-4f6c-d104768a1214',
  characteristicUUID: '19b10003-e8f2-537e-4f6c-d104768a1214'
};