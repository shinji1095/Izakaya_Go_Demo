import { ButtonStateBluePrint } from"./ButtonBluePrint"

export const ButtonState1 = new ButtonStateBluePrint(
    ['あ', 'い', 'う', 'え', 'お'],
    false, [],
    false, [],
    true, ['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ'],
    ['@', '#', '/', '&', '_'],
    ['1']
)

export const ButtonState2 = new ButtonStateBluePrint(
    ['か', 'き', 'く', 'け', 'こ'],
    true, ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
    false, [],
    false, [],
    ['a', 'b', 'c'],
    ['2']
)

export const ButtonState3 = new ButtonStateBluePrint(
    ['さ', 'し', 'す', 'せ', 'そ'],
    true, ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
    false, [],
    false, [],
    ['d', 'e', 'f'],
    ['3']
)

export const ButtonState4 = new ButtonStateBluePrint(
    ['た', 'ち', 'つ', 'て', 'と'],
    true, ['だ', 'ぢ', 'づ', 'で', 'ど'],
    false, [],
    true, ['', '', 'っ', '', ''],
    ['g', 'h', 'i'],
    ['4']
)

export const ButtonState5 = new ButtonStateBluePrint(
    ['な', 'に', 'ぬ', 'ね', 'の'],
    false, [],
    false, [],
    false, [],
    ['j', 'k', 'l'],
    ['5']
)

export const ButtonState6 = new ButtonStateBluePrint(
    ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    true, ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
    true, ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
    false, [],
    ['m', 'n', 'o'],
    ['6']
)

export const ButtonState7 = new ButtonStateBluePrint(
    ['ま', 'み', 'む', 'め', 'も'],
    false, [],
    false, [],
    false, [],
    ['p', 'q', 'r', 's'],
    ['7']
)

export const ButtonState8 = new ButtonStateBluePrint(
    ['や', 'ゆ', 'よ'],
    false, [],
    false, [],
    false, [],
    ['t', 'u', 'v'],
    ['8']
)

export const ButtonState9 = new ButtonStateBluePrint(
    ['ら', 'り', 'る', 'れ', 'ろ'],
    false, [],
    false, [],
    false, [],
    ['w', 'x', 'y', 'z'],
    ['9']
)

export const ButtonState10 = new ButtonStateBluePrint(
    ['わ', 'を', 'ん'],
    false, [],
    false, [],
    false, [],
    [],
    ['0']
)
