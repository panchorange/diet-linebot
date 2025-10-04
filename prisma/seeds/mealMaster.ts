// prisma/seeds/mealMaster.ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type Row = {
    id: number
    name: string
    caloriePer100g: number
    proteinPer100g: number
    fatPer100g: number
    carbohydratePer100g: number
}

export async function seedMealMaster() {
    const rows: Row[] = [
        {
            id: 1,
            name: "白ごはん",
            caloriePer100g: 168,
            proteinPer100g: 2.5,
            fatPer100g: 0.3,
            carbohydratePer100g: 37
        },
        {
            id: 2,
            name: "玄米ごはん",
            caloriePer100g: 165,
            proteinPer100g: 2.8,
            fatPer100g: 1.0,
            carbohydratePer100g: 34.7
        },
        {
            id: 3,
            name: "食パン",
            caloriePer100g: 264,
            proteinPer100g: 9,
            fatPer100g: 4.5,
            carbohydratePer100g: 46
        },
        {
            id: 4,
            name: "うどん(ゆで)",
            caloriePer100g: 105,
            proteinPer100g: 2.6,
            fatPer100g: 0.4,
            carbohydratePer100g: 21.6
        },
        {
            id: 5,
            name: "そば(ゆで)",
            caloriePer100g: 114,
            proteinPer100g: 4.8,
            fatPer100g: 1.0,
            carbohydratePer100g: 24
        },
        {
            id: 6,
            name: "ラーメン(醤油)",
            caloriePer100g: 150,
            proteinPer100g: 6,
            fatPer100g: 5,
            carbohydratePer100g: 20
        },
        {
            id: 7,
            name: "パスタ(ミートソース)",
            caloriePer100g: 160,
            proteinPer100g: 6,
            fatPer100g: 4.5,
            carbohydratePer100g: 25
        },
        {
            id: 8,
            name: "カレーライス",
            caloriePer100g: 130,
            proteinPer100g: 3,
            fatPer100g: 4,
            carbohydratePer100g: 20
        },
        {
            id: 9,
            name: "牛丼",
            caloriePer100g: 177,
            proteinPer100g: 8,
            fatPer100g: 8,
            carbohydratePer100g: 20
        },
        {
            id: 10,
            name: "親子丼",
            caloriePer100g: 150,
            proteinPer100g: 8,
            fatPer100g: 6,
            carbohydratePer100g: 15
        },
        {
            id: 11,
            name: "かつ丼",
            caloriePer100g: 185,
            proteinPer100g: 7,
            fatPer100g: 10,
            carbohydratePer100g: 17
        },
        {
            id: 12,
            name: "天丼",
            caloriePer100g: 200,
            proteinPer100g: 6,
            fatPer100g: 10,
            carbohydratePer100g: 22
        },
        {
            id: 13,
            name: "鮭の塩焼き",
            caloriePer100g: 230,
            proteinPer100g: 22,
            fatPer100g: 15,
            carbohydratePer100g: 0
        },
        {
            id: 14,
            name: "さばの味噌煮",
            caloriePer100g: 240,
            proteinPer100g: 20,
            fatPer100g: 16,
            carbohydratePer100g: 6
        },
        {
            id: 15,
            name: "焼き魚(さんま)",
            caloriePer100g: 310,
            proteinPer100g: 23,
            fatPer100g: 25,
            carbohydratePer100g: 0
        },
        {
            id: 16,
            name: "刺身(まぐろ赤身)",
            caloriePer100g: 125,
            proteinPer100g: 26,
            fatPer100g: 1,
            carbohydratePer100g: 0
        },
        {
            id: 17,
            name: "唐揚げ",
            caloriePer100g: 250,
            proteinPer100g: 16,
            fatPer100g: 17,
            carbohydratePer100g: 10
        },
        {
            id: 18,
            name: "とんかつ",
            caloriePer100g: 300,
            proteinPer100g: 17,
            fatPer100g: 22,
            carbohydratePer100g: 12
        },
        {
            id: 19,
            name: "焼き鳥(もも塩)",
            caloriePer100g: 200,
            proteinPer100g: 17,
            fatPer100g: 14,
            carbohydratePer100g: 0
        },
        {
            id: 20,
            name: "ハンバーグ",
            caloriePer100g: 230,
            proteinPer100g: 14,
            fatPer100g: 15,
            carbohydratePer100g: 10
        },
        {
            id: 21,
            name: "シュウマイ",
            caloriePer100g: 190,
            proteinPer100g: 9,
            fatPer100g: 10,
            carbohydratePer100g: 16
        },
        {
            id: 22,
            name: "餃子",
            caloriePer100g: 200,
            proteinPer100g: 8,
            fatPer100g: 10,
            carbohydratePer100g: 22
        },
        {
            id: 23,
            name: "たこ焼き",
            caloriePer100g: 210,
            proteinPer100g: 7,
            fatPer100g: 10,
            carbohydratePer100g: 26
        },
        {
            id: 24,
            name: "お好み焼き",
            caloriePer100g: 170,
            proteinPer100g: 7,
            fatPer100g: 8,
            carbohydratePer100g: 20
        },
        {
            id: 25,
            name: "たまご焼き",
            caloriePer100g: 150,
            proteinPer100g: 10,
            fatPer100g: 10,
            carbohydratePer100g: 3
        },
        {
            id: 26,
            name: "納豆",
            caloriePer100g: 200,
            proteinPer100g: 17,
            fatPer100g: 10,
            carbohydratePer100g: 12
        },
        {
            id: 27,
            name: "冷奴",
            caloriePer100g: 80,
            proteinPer100g: 7,
            fatPer100g: 4,
            carbohydratePer100g: 3
        },
        {
            id: 28,
            name: "味噌汁",
            caloriePer100g: 35,
            proteinPer100g: 3,
            fatPer100g: 1,
            carbohydratePer100g: 4
        },
        {
            id: 29,
            name: "きんぴらごぼう",
            caloriePer100g: 140,
            proteinPer100g: 2,
            fatPer100g: 6,
            carbohydratePer100g: 20
        },
        {
            id: 30,
            name: "ひじき煮",
            caloriePer100g: 110,
            proteinPer100g: 3,
            fatPer100g: 3,
            carbohydratePer100g: 18
        },
        {
            id: 31,
            name: "ポテトサラダ",
            caloriePer100g: 150,
            proteinPer100g: 2,
            fatPer100g: 9,
            carbohydratePer100g: 16
        },
        {
            id: 32,
            name: "マカロニサラダ",
            caloriePer100g: 190,
            proteinPer100g: 4,
            fatPer100g: 10,
            carbohydratePer100g: 22
        },
        {
            id: 33,
            name: "野菜サラダ",
            caloriePer100g: 20,
            proteinPer100g: 1,
            fatPer100g: 0.2,
            carbohydratePer100g: 4
        },
        {
            id: 34,
            name: "サーモンアボカド丼",
            caloriePer100g: 200,
            proteinPer100g: 12,
            fatPer100g: 12,
            carbohydratePer100g: 14
        },
        {
            id: 35,
            name: "豚汁",
            caloriePer100g: 80,
            proteinPer100g: 5,
            fatPer100g: 4,
            carbohydratePer100g: 7
        },
        {
            id: 36,
            name: "クリームシチュー",
            caloriePer100g: 110,
            proteinPer100g: 3,
            fatPer100g: 6,
            carbohydratePer100g: 11
        },
        {
            id: 37,
            name: "ビーフシチュー",
            caloriePer100g: 120,
            proteinPer100g: 6,
            fatPer100g: 6,
            carbohydratePer100g: 10
        },
        {
            id: 38,
            name: "焼きそば",
            caloriePer100g: 190,
            proteinPer100g: 6,
            fatPer100g: 8,
            carbohydratePer100g: 25
        },
        {
            id: 39,
            name: "チャーハン",
            caloriePer100g: 215,
            proteinPer100g: 5,
            fatPer100g: 9,
            carbohydratePer100g: 30
        },
        {
            id: 40,
            name: "オムライス",
            caloriePer100g: 180,
            proteinPer100g: 7,
            fatPer100g: 8,
            carbohydratePer100g: 20
        },
        {
            id: 41,
            name: "おにぎり(鮭)",
            caloriePer100g: 180,
            proteinPer100g: 4,
            fatPer100g: 3,
            carbohydratePer100g: 36
        },
        {
            id: 42,
            name: "おにぎり(ツナマヨ)",
            caloriePer100g: 220,
            proteinPer100g: 5,
            fatPer100g: 8,
            carbohydratePer100g: 34
        },
        {
            id: 43,
            name: "おにぎり(梅)",
            caloriePer100g: 170,
            proteinPer100g: 3,
            fatPer100g: 1,
            carbohydratePer100g: 37
        },
        {
            id: 44,
            name: "枝豆",
            caloriePer100g: 135,
            proteinPer100g: 11,
            fatPer100g: 6,
            carbohydratePer100g: 9
        },
        {
            id: 45,
            name: "バナナ",
            caloriePer100g: 86,
            proteinPer100g: 1.1,
            fatPer100g: 0.3,
            carbohydratePer100g: 22
        },
        {
            id: 46,
            name: "りんご",
            caloriePer100g: 54,
            proteinPer100g: 0.3,
            fatPer100g: 0.2,
            carbohydratePer100g: 14
        },
        {
            id: 47,
            name: "ヨーグルト(無糖)",
            caloriePer100g: 62,
            proteinPer100g: 3.6,
            fatPer100g: 3.0,
            carbohydratePer100g: 4.5
        },
        {
            id: 48,
            name: "コロッケ",
            caloriePer100g: 180,
            proteinPer100g: 4,
            fatPer100g: 9,
            carbohydratePer100g: 22
        },
        {
            id: 49,
            name: "豆腐ハンバーグ",
            caloriePer100g: 170,
            proteinPer100g: 12,
            fatPer100g: 10,
            carbohydratePer100g: 8
        },
        {
            id: 50,
            name: "ちらし寿司",
            caloriePer100g: 150,
            proteinPer100g: 5,
            fatPer100g: 3,
            carbohydratePer100g: 28
        },
        {
            id: 51,
            name: "豚骨ラーメン",
            caloriePer100g: 170,
            proteinPer100g: 7,
            fatPer100g: 7,
            carbohydratePer100g: 22
        },
        {
            id: 52,
            name: "麻婆豆腐",
            caloriePer100g: 140,
            proteinPer100g: 7,
            fatPer100g: 9,
            carbohydratePer100g: 6
        },
        {
            id: 53,
            name: "カルボナーラ",
            caloriePer100g: 240,
            proteinPer100g: 9,
            fatPer100g: 13,
            carbohydratePer100g: 26
        },
        {
            id: 54,
            name: "牛乳",
            caloriePer100g: 67,
            proteinPer100g: 3.3,
            fatPer100g: 3.8,
            carbohydratePer100g: 4.8
        },
        {
            id: 55,
            name: "担々麺",
            caloriePer100g: 190,
            proteinPer100g: 7,
            fatPer100g: 9,
            carbohydratePer100g: 23
        },
        {
            id: 56,
            name: "ビール",
            caloriePer100g: 40,
            proteinPer100g: 0.3,
            fatPer100g: 0,
            carbohydratePer100g: 3.1
        },
        {
            id: 57,
            name: "日本酒",
            caloriePer100g: 103,
            proteinPer100g: 0.4,
            fatPer100g: 0,
            carbohydratePer100g: 3.6
        },
        {
            id: 58,
            name: "ワイン(赤)",
            caloriePer100g: 73,
            proteinPer100g: 0.2,
            fatPer100g: 0,
            carbohydratePer100g: 2.6
        },
        {
            id: 59,
            name: "ハイボール",
            caloriePer100g: 40,
            proteinPer100g: 0,
            fatPer100g: 0,
            carbohydratePer100g: 0
        },
        {
            id: 60,
            name: "チューハイ(レモン)",
            caloriePer100g: 54,
            proteinPer100g: 0,
            fatPer100g: 0,
            carbohydratePer100g: 5
        },
        {
            id: 61,
            name: "鶏の照り焼き",
            caloriePer100g: 220,
            proteinPer100g: 18,
            fatPer100g: 12,
            carbohydratePer100g: 10
        },
        {
            id: 62,
            name: "ウインナー",
            caloriePer100g: 300,
            proteinPer100g: 12,
            fatPer100g: 25,
            carbohydratePer100g: 2
        },
        {
            id: 63,
            name: "玉子焼き(甘口)",
            caloriePer100g: 170,
            proteinPer100g: 10,
            fatPer100g: 11,
            carbohydratePer100g: 8
        },
        {
            id: 64,
            name: "漬物(きゅうり)",
            caloriePer100g: 25,
            proteinPer100g: 1.5,
            fatPer100g: 0.1,
            carbohydratePer100g: 5
        },
        {
            id: 65,
            name: "チキン南蛮",
            caloriePer100g: 250,
            proteinPer100g: 15,
            fatPer100g: 15,
            carbohydratePer100g: 18
        },
        {
            id: 66,
            name: "アジフライ",
            caloriePer100g: 260,
            proteinPer100g: 16,
            fatPer100g: 18,
            carbohydratePer100g: 12
        },
        {
            id: 67,
            name: "ローストビーフ",
            caloriePer100g: 190,
            proteinPer100g: 24,
            fatPer100g: 8,
            carbohydratePer100g: 1
        },
        {
            id: 68,
            name: "牛ステーキ(赤身)",
            caloriePer100g: 220,
            proteinPer100g: 26,
            fatPer100g: 12,
            carbohydratePer100g: 0
        },
        {
            id: 69,
            name: "ほうれん草のおひたし",
            caloriePer100g: 40,
            proteinPer100g: 3,
            fatPer100g: 1,
            carbohydratePer100g: 6
        },
        {
            id: 70,
            name: "ブロッコリーサラダ",
            caloriePer100g: 60,
            proteinPer100g: 4,
            fatPer100g: 3,
            carbohydratePer100g: 7
        },
        {
            id: 71,
            name: "きのこソテー",
            caloriePer100g: 90,
            proteinPer100g: 3,
            fatPer100g: 5,
            carbohydratePer100g: 8
        },
        {
            id: 72,
            name: "海老チリ",
            caloriePer100g: 140,
            proteinPer100g: 12,
            fatPer100g: 6,
            carbohydratePer100g: 12
        },
        {
            id: 73,
            name: "ツナサラダ",
            caloriePer100g: 120,
            proteinPer100g: 10,
            fatPer100g: 7,
            carbohydratePer100g: 6
        },
        {
            id: 74,
            name: "きゅうりの酢の物",
            caloriePer100g: 35,
            proteinPer100g: 1,
            fatPer100g: 0.2,
            carbohydratePer100g: 7
        },
        {
            id: 75,
            name: "豆腐サラダ",
            caloriePer100g: 80,
            proteinPer100g: 6,
            fatPer100g: 4,
            carbohydratePer100g: 6
        },
        {
            id: 76,
            name: "天津飯",
            caloriePer100g: 160,
            proteinPer100g: 6,
            fatPer100g: 7,
            carbohydratePer100g: 18
        },
        {
            id: 77,
            name: "回鍋肉",
            caloriePer100g: 180,
            proteinPer100g: 10,
            fatPer100g: 12,
            carbohydratePer100g: 8
        },
        {
            id: 78,
            name: "青椒肉絲",
            caloriePer100g: 150,
            proteinPer100g: 12,
            fatPer100g: 9,
            carbohydratePer100g: 7
        },
        {
            id: 79,
            name: "八宝菜",
            caloriePer100g: 120,
            proteinPer100g: 8,
            fatPer100g: 6,
            carbohydratePer100g: 10
        },
        {
            id: 80,
            name: "酢豚",
            caloriePer100g: 200,
            proteinPer100g: 10,
            fatPer100g: 12,
            carbohydratePer100g: 15
        },
        {
            id: 81,
            name: "春巻き",
            caloriePer100g: 230,
            proteinPer100g: 6,
            fatPer100g: 14,
            carbohydratePer100g: 22
        },
        {
            id: 82,
            name: "麻婆茄子",
            caloriePer100g: 130,
            proteinPer100g: 6,
            fatPer100g: 9,
            carbohydratePer100g: 8
        },
        {
            id: 83,
            name: "エビマヨ",
            caloriePer100g: 210,
            proteinPer100g: 10,
            fatPer100g: 15,
            carbohydratePer100g: 10
        },
        {
            id: 84,
            name: "小籠包",
            caloriePer100g: 220,
            proteinPer100g: 9,
            fatPer100g: 11,
            carbohydratePer100g: 24
        },
        {
            id: 85,
            name: "春雨サラダ",
            caloriePer100g: 90,
            proteinPer100g: 2,
            fatPer100g: 4,
            carbohydratePer100g: 12
        },
        {
            id: 86,
            name: "よだれ鶏",
            caloriePer100g: 180,
            proteinPer100g: 15,
            fatPer100g: 11,
            carbohydratePer100g: 5
        },
        {
            id: 87,
            name: "ビビンバ",
            caloriePer100g: 150,
            proteinPer100g: 7,
            fatPer100g: 5,
            carbohydratePer100g: 22
        },
        {
            id: 88,
            name: "チヂミ",
            caloriePer100g: 170,
            proteinPer100g: 5,
            fatPer100g: 8,
            carbohydratePer100g: 20
        },
        {
            id: 89,
            name: "サムギョプサル",
            caloriePer100g: 380,
            proteinPer100g: 14,
            fatPer100g: 35,
            carbohydratePer100g: 1
        },
        {
            id: 90,
            name: "キムチチゲ",
            caloriePer100g: 70,
            proteinPer100g: 5,
            fatPer100g: 3,
            carbohydratePer100g: 6
        },
        {
            id: 91,
            name: "タッカルビ",
            caloriePer100g: 160,
            proteinPer100g: 12,
            fatPer100g: 8,
            carbohydratePer100g: 12
        },
        {
            id: 92,
            name: "ガパオライス",
            caloriePer100g: 170,
            proteinPer100g: 8,
            fatPer100g: 7,
            carbohydratePer100g: 20
        },
        {
            id: 93,
            name: "グリーンカレー",
            caloriePer100g: 140,
            proteinPer100g: 6,
            fatPer100g: 8,
            carbohydratePer100g: 12
        },
        {
            id: 94,
            name: "パッタイ",
            caloriePer100g: 180,
            proteinPer100g: 6,
            fatPer100g: 7,
            carbohydratePer100g: 25
        },
        {
            id: 95,
            name: "トムヤムクン",
            caloriePer100g: 50,
            proteinPer100g: 4,
            fatPer100g: 2,
            carbohydratePer100g: 5
        },
        {
            id: 96,
            name: "フォー",
            caloriePer100g: 110,
            proteinPer100g: 5,
            fatPer100g: 2,
            carbohydratePer100g: 20
        },
        {
            id: 97,
            name: "生春巻き",
            caloriePer100g: 100,
            proteinPer100g: 4,
            fatPer100g: 3,
            carbohydratePer100g: 15
        },
        {
            id: 98,
            name: "ナシゴレン",
            caloriePer100g: 180,
            proteinPer100g: 6,
            fatPer100g: 8,
            carbohydratePer100g: 23
        },
        {
            id: 99,
            name: "バターチキンカレー",
            caloriePer100g: 160,
            proteinPer100g: 8,
            fatPer100g: 9,
            carbohydratePer100g: 13
        },
        {
            id: 100,
            name: "タンドリーチキン",
            caloriePer100g: 190,
            proteinPer100g: 18,
            fatPer100g: 10,
            carbohydratePer100g: 5
        },
        {
            id: 101,
            name: "ナン",
            caloriePer100g: 260,
            proteinPer100g: 8,
            fatPer100g: 5,
            carbohydratePer100g: 48
        },
        {
            id: 102,
            name: "サモサ",
            caloriePer100g: 250,
            proteinPer100g: 5,
            fatPer100g: 13,
            carbohydratePer100g: 30
        },
        {
            id: 103,
            name: "ピザ(マルゲリータ)",
            caloriePer100g: 270,
            proteinPer100g: 11,
            fatPer100g: 11,
            carbohydratePer100g: 33
        },
        {
            id: 104,
            name: "ピザ(ペパロニ)",
            caloriePer100g: 300,
            proteinPer100g: 12,
            fatPer100g: 14,
            carbohydratePer100g: 32
        },
        {
            id: 105,
            name: "グラタン",
            caloriePer100g: 140,
            proteinPer100g: 6,
            fatPer100g: 7,
            carbohydratePer100g: 14
        },
        {
            id: 106,
            name: "ドリア",
            caloriePer100g: 150,
            proteinPer100g: 5,
            fatPer100g: 6,
            carbohydratePer100g: 20
        },
        {
            id: 107,
            name: "ラザニア",
            caloriePer100g: 180,
            proteinPer100g: 9,
            fatPer100g: 9,
            carbohydratePer100g: 17
        },
        {
            id: 108,
            name: "ペペロンチーノ",
            caloriePer100g: 160,
            proteinPer100g: 5,
            fatPer100g: 6,
            carbohydratePer100g: 23
        },
        {
            id: 109,
            name: "ペスカトーレ",
            caloriePer100g: 150,
            proteinPer100g: 8,
            fatPer100g: 5,
            carbohydratePer100g: 21
        },
        {
            id: 110,
            name: "ボロネーゼ",
            caloriePer100g: 170,
            proteinPer100g: 8,
            fatPer100g: 7,
            carbohydratePer100g: 20
        },
        {
            id: 111,
            name: "アラビアータ",
            caloriePer100g: 155,
            proteinPer100g: 5,
            fatPer100g: 5,
            carbohydratePer100g: 24
        },
        {
            id: 112,
            name: "リゾット",
            caloriePer100g: 130,
            proteinPer100g: 4,
            fatPer100g: 5,
            carbohydratePer100g: 18
        },
        {
            id: 113,
            name: "ローストチキン",
            caloriePer100g: 190,
            proteinPer100g: 24,
            fatPer100g: 9,
            carbohydratePer100g: 1
        },
        {
            id: 114,
            name: "ポークソテー",
            caloriePer100g: 250,
            proteinPer100g: 20,
            fatPer100g: 18,
            carbohydratePer100g: 2
        },
        {
            id: 115,
            name: "ビーフストロガノフ",
            caloriePer100g: 170,
            proteinPer100g: 10,
            fatPer100g: 10,
            carbohydratePer100g: 12
        },
        {
            id: 116,
            name: "ロールキャベツ",
            caloriePer100g: 110,
            proteinPer100g: 7,
            fatPer100g: 6,
            carbohydratePer100g: 8
        },
        {
            id: 117,
            name: "ミートボール",
            caloriePer100g: 200,
            proteinPer100g: 12,
            fatPer100g: 13,
            carbohydratePer100g: 10
        },
        {
            id: 118,
            name: "冷やし中華",
            caloriePer100g: 140,
            proteinPer100g: 6,
            fatPer100g: 4,
            carbohydratePer100g: 22
        },
        {
            id: 119,
            name: "つけ麺",
            caloriePer100g: 160,
            proteinPer100g: 7,
            fatPer100g: 6,
            carbohydratePer100g: 22
        },
        {
            id: 120,
            name: "そうめん",
            caloriePer100g: 127,
            proteinPer100g: 3.5,
            fatPer100g: 0.4,
            carbohydratePer100g: 25.8
        },
        {
            id: 121,
            name: "ざるそば",
            caloriePer100g: 114,
            proteinPer100g: 4.8,
            fatPer100g: 1.0,
            carbohydratePer100g: 24
        },
        {
            id: 122,
            name: "味噌ラーメン",
            caloriePer100g: 165,
            proteinPer100g: 6,
            fatPer100g: 6,
            carbohydratePer100g: 23
        },
        {
            id: 123,
            name: "塩ラーメン",
            caloriePer100g: 140,
            proteinPer100g: 5,
            fatPer100g: 4,
            carbohydratePer100g: 22
        },
        {
            id: 124,
            name: "サンドイッチ(ハム)",
            caloriePer100g: 240,
            proteinPer100g: 8,
            fatPer100g: 10,
            carbohydratePer100g: 30
        },
        {
            id: 125,
            name: "サンドイッチ(ツナ)",
            caloriePer100g: 260,
            proteinPer100g: 9,
            fatPer100g: 12,
            carbohydratePer100g: 28
        },
        {
            id: 126,
            name: "サンドイッチ(卵)",
            caloriePer100g: 250,
            proteinPer100g: 8,
            fatPer100g: 11,
            carbohydratePer100g: 30
        },
        {
            id: 127,
            name: "ホットドッグ",
            caloriePer100g: 280,
            proteinPer100g: 10,
            fatPer100g: 15,
            carbohydratePer100g: 28
        },
        {
            id: 128,
            name: "ピザトースト",
            caloriePer100g: 280,
            proteinPer100g: 11,
            fatPer100g: 12,
            carbohydratePer100g: 32
        },
        {
            id: 129,
            name: "フレンチトースト",
            caloriePer100g: 220,
            proteinPer100g: 7,
            fatPer100g: 9,
            carbohydratePer100g: 28
        },
        {
            id: 130,
            name: "パンケーキ",
            caloriePer100g: 230,
            proteinPer100g: 6,
            fatPer100g: 8,
            carbohydratePer100g: 35
        },
        {
            id: 131,
            name: "ワッフル",
            caloriePer100g: 290,
            proteinPer100g: 6,
            fatPer100g: 13,
            carbohydratePer100g: 38
        },
        {
            id: 132,
            name: "シリアル",
            caloriePer100g: 380,
            proteinPer100g: 8,
            fatPer100g: 4,
            carbohydratePer100g: 80
        },
        {
            id: 133,
            name: "オートミール",
            caloriePer100g: 380,
            proteinPer100g: 13,
            fatPer100g: 7,
            carbohydratePer100g: 69
        },
        {
            id: 134,
            name: "グラノーラ",
            caloriePer100g: 470,
            proteinPer100g: 10,
            fatPer100g: 20,
            carbohydratePer100g: 64
        },
        {
            id: 135,
            name: "スクランブルエッグ",
            caloriePer100g: 150,
            proteinPer100g: 11,
            fatPer100g: 11,
            carbohydratePer100g: 2
        },
        {
            id: 136,
            name: "目玉焼き",
            caloriePer100g: 140,
            proteinPer100g: 12,
            fatPer100g: 10,
            carbohydratePer100g: 1
        },
        {
            id: 137,
            name: "オムレツ",
            caloriePer100g: 160,
            proteinPer100g: 11,
            fatPer100g: 12,
            carbohydratePer100g: 2
        },
        {
            id: 138,
            name: "ベーコンエッグ",
            caloriePer100g: 210,
            proteinPer100g: 14,
            fatPer100g: 16,
            carbohydratePer100g: 1
        },
        {
            id: 139,
            name: "フライドポテト",
            caloriePer100g: 270,
            proteinPer100g: 3,
            fatPer100g: 14,
            carbohydratePer100g: 35
        },
        {
            id: 140,
            name: "ポテトチップス",
            caloriePer100g: 550,
            proteinPer100g: 6,
            fatPer100g: 35,
            carbohydratePer100g: 50
        },
        {
            id: 141,
            name: "ナゲット",
            caloriePer100g: 280,
            proteinPer100g: 14,
            fatPer100g: 18,
            carbohydratePer100g: 18
        },
        {
            id: 142,
            name: "エビフライ",
            caloriePer100g: 240,
            proteinPer100g: 14,
            fatPer100g: 15,
            carbohydratePer100g: 16
        },
        {
            id: 143,
            name: "イカリング",
            caloriePer100g: 220,
            proteinPer100g: 11,
            fatPer100g: 12,
            carbohydratePer100g: 20
        },
        {
            id: 144,
            name: "クリームコロッケ",
            caloriePer100g: 190,
            proteinPer100g: 5,
            fatPer100g: 10,
            carbohydratePer100g: 22
        },
        {
            id: 145,
            name: "メンチカツ",
            caloriePer100g: 280,
            proteinPer100g: 12,
            fatPer100g: 18,
            carbohydratePer100g: 20
        },
        {
            id: 146,
            name: "牡蠣フライ",
            caloriePer100g: 210,
            proteinPer100g: 8,
            fatPer100g: 12,
            carbohydratePer100g: 18
        },
        {
            id: 147,
            name: "天ぷら盛り合わせ",
            caloriePer100g: 190,
            proteinPer100g: 6,
            fatPer100g: 10,
            carbohydratePer100g: 20
        },
        {
            id: 148,
            name: "茶碗蒸し",
            caloriePer100g: 80,
            proteinPer100g: 6,
            fatPer100g: 3,
            carbohydratePer100g: 7
        },
        {
            id: 149,
            name: "いなり寿司",
            caloriePer100g: 190,
            proteinPer100g: 4,
            fatPer100g: 5,
            carbohydratePer100g: 32
        },
        {
            id: 150,
            name: "巻き寿司",
            caloriePer100g: 160,
            proteinPer100g: 5,
            fatPer100g: 2,
            carbohydratePer100g: 32
        },
        {
            id: 151,
            name: "握り寿司(まぐろ)",
            caloriePer100g: 140,
            proteinPer100g: 12,
            fatPer100g: 1,
            carbohydratePer100g: 24
        },
        {
            id: 152,
            name: "うな重",
            caloriePer100g: 190,
            proteinPer100g: 9,
            fatPer100g: 8,
            carbohydratePer100g: 22
        },
        {
            id: 153,
            name: "鉄火丼",
            caloriePer100g: 150,
            proteinPer100g: 11,
            fatPer100g: 2,
            carbohydratePer100g: 26
        },
        {
            id: 154,
            name: "海鮮丼",
            caloriePer100g: 160,
            proteinPer100g: 10,
            fatPer100g: 3,
            carbohydratePer100g: 26
        },
        {
            id: 155,
            name: "ネギトロ丼",
            caloriePer100g: 180,
            proteinPer100g: 9,
            fatPer100g: 6,
            carbohydratePer100g: 25
        },
        {
            id: 156,
            name: "しょうが焼き",
            caloriePer100g: 230,
            proteinPer100g: 16,
            fatPer100g: 14,
            carbohydratePer100g: 12
        },
        {
            id: 157,
            name: "肉じゃが",
            caloriePer100g: 120,
            proteinPer100g: 6,
            fatPer100g: 5,
            carbohydratePer100g: 15
        },
        {
            id: 158,
            name: "筑前煮",
            caloriePer100g: 100,
            proteinPer100g: 5,
            fatPer100g: 3,
            carbohydratePer100g: 14
        },
        {
            id: 159,
            name: "煮魚(カレイ)",
            caloriePer100g: 110,
            proteinPer100g: 15,
            fatPer100g: 3,
            carbohydratePer100g: 6
        },
        {
            id: 160,
            name: "ぶり大根",
            caloriePer100g: 130,
            proteinPer100g: 12,
            fatPer100g: 6,
            carbohydratePer100g: 8
        },
        {
            id: 161,
            name: "かぼちゃの煮物",
            caloriePer100g: 90,
            proteinPer100g: 1.5,
            fatPer100g: 0.2,
            carbohydratePer100g: 21
        },
        {
            id: 162,
            name: "里芋の煮っころがし",
            caloriePer100g: 95,
            proteinPer100g: 1.8,
            fatPer100g: 0.5,
            carbohydratePer100g: 22
        },
        {
            id: 163,
            name: "厚揚げの煮物",
            caloriePer100g: 110,
            proteinPer100g: 7,
            fatPer100g: 6,
            carbohydratePer100g: 8
        },
        {
            id: 164,
            name: "がんもどきの煮物",
            caloriePer100g: 120,
            proteinPer100g: 8,
            fatPer100g: 7,
            carbohydratePer100g: 9
        },
        {
            id: 165,
            name: "キャベツの浅漬け",
            caloriePer100g: 20,
            proteinPer100g: 1,
            fatPer100g: 0.1,
            carbohydratePer100g: 4
        },
        {
            id: 166,
            name: "白菜の浅漬け",
            caloriePer100g: 18,
            proteinPer100g: 0.8,
            fatPer100g: 0.1,
            carbohydratePer100g: 3.5
        },
        {
            id: 167,
            name: "キムチ",
            caloriePer100g: 46,
            proteinPer100g: 2.8,
            fatPer100g: 0.5,
            carbohydratePer100g: 8.3
        },
        {
            id: 168,
            name: "ザーサイ",
            caloriePer100g: 23,
            proteinPer100g: 1.5,
            fatPer100g: 0.2,
            carbohydratePer100g: 4.5
        },
        {
            id: 169,
            name: "メンマ",
            caloriePer100g: 19,
            proteinPer100g: 1.3,
            fatPer100g: 0.2,
            carbohydratePer100g: 3.8
        },
        {
            id: 170,
            name: "もずく酢",
            caloriePer100g: 20,
            proteinPer100g: 0.3,
            fatPer100g: 0.1,
            carbohydratePer100g: 4.5
        },
        {
            id: 171,
            name: "わかめスープ",
            caloriePer100g: 15,
            proteinPer100g: 1,
            fatPer100g: 0.5,
            carbohydratePer100g: 2
        },
        {
            id: 172,
            name: "コーンスープ",
            caloriePer100g: 70,
            proteinPer100g: 2,
            fatPer100g: 3,
            carbohydratePer100g: 9
        },
        {
            id: 173,
            name: "ミネストローネ",
            caloriePer100g: 60,
            proteinPer100g: 2,
            fatPer100g: 2,
            carbohydratePer100g: 8
        },
        {
            id: 174,
            name: "オニオンスープ",
            caloriePer100g: 40,
            proteinPer100g: 1,
            fatPer100g: 2,
            carbohydratePer100g: 5
        },
        {
            id: 175,
            name: "コンソメスープ",
            caloriePer100g: 25,
            proteinPer100g: 1.5,
            fatPer100g: 1,
            carbohydratePer100g: 3
        },
        {
            id: 176,
            name: "ハヤシライス",
            caloriePer100g: 145,
            proteinPer100g: 5,
            fatPer100g: 6,
            carbohydratePer100g: 18
        },
        {
            id: 177,
            name: "チキンステーキ",
            caloriePer100g: 210,
            proteinPer100g: 22,
            fatPer100g: 12,
            carbohydratePer100g: 2
        },
        {
            id: 178,
            name: "コーヒー",
            caloriePer100g: 4,
            proteinPer100g: 0.2,
            fatPer100g: 0,
            carbohydratePer100g: 0.7
        },
        {
            id: 179,
            name: "カフェラテ",
            caloriePer100g: 45,
            proteinPer100g: 2,
            fatPer100g: 2,
            carbohydratePer100g: 5
        },
        {
            id: 180,
            name: "紅茶",
            caloriePer100g: 1,
            proteinPer100g: 0.1,
            fatPer100g: 0,
            carbohydratePer100g: 0.1
        },
        {
            id: 181,
            name: "緑茶",
            caloriePer100g: 2,
            proteinPer100g: 0.2,
            fatPer100g: 0,
            carbohydratePer100g: 0.2
        },
        {
            id: 182,
            name: "烏龍茶",
            caloriePer100g: 0,
            proteinPer100g: 0,
            fatPer100g: 0,
            carbohydratePer100g: 0.1
        },
        {
            id: 183,
            name: "麦茶",
            caloriePer100g: 1,
            proteinPer100g: 0,
            fatPer100g: 0,
            carbohydratePer100g: 0.3
        },
        {
            id: 184,
            name: "コーラ",
            caloriePer100g: 45,
            proteinPer100g: 0,
            fatPer100g: 0,
            carbohydratePer100g: 11.3
        },
        {
            id: 185,
            name: "オレンジジュース",
            caloriePer100g: 42,
            proteinPer100g: 0.7,
            fatPer100g: 0.1,
            carbohydratePer100g: 10.7
        },
        {
            id: 186,
            name: "野菜ジュース",
            caloriePer100g: 21,
            proteinPer100g: 0.7,
            fatPer100g: 0.1,
            carbohydratePer100g: 4.8
        },
        {
            id: 187,
            name: "豆乳",
            caloriePer100g: 46,
            proteinPer100g: 3.6,
            fatPer100g: 2.0,
            carbohydratePer100g: 3.1
        },
        {
            id: 188,
            name: "スポーツドリンク",
            caloriePer100g: 25,
            proteinPer100g: 0,
            fatPer100g: 0,
            carbohydratePer100g: 6.2
        },
        {
            id: 189,
            name: "ココア",
            caloriePer100g: 68,
            proteinPer100g: 2,
            fatPer100g: 2,
            carbohydratePer100g: 11
        },
        {
            id: 190,
            name: "ハンバーガー",
            caloriePer100g: 280,
            proteinPer100g: 12,
            fatPer100g: 14,
            carbohydratePer100g: 28
        },
        {
            id: 191,
            name: "ビーフカレー",
            caloriePer100g: 125,
            proteinPer100g: 4,
            fatPer100g: 5,
            carbohydratePer100g: 16
        },
        {
            id: 192,
            name: "キーマカレー",
            caloriePer100g: 140,
            proteinPer100g: 5,
            fatPer100g: 6,
            carbohydratePer100g: 17
        },
        {
            id: 193,
            name: "焼肉",
            caloriePer100g: 350,
            proteinPer100g: 16,
            fatPer100g: 30,
            carbohydratePer100g: 1
        },
        {
            id: 194,
            name: "ステーキ",
            caloriePer100g: 250,
            proteinPer100g: 25,
            fatPer100g: 15,
            carbohydratePer100g: 1
        },
        {
            id: 195,
            name: "クラムチャウダー",
            caloriePer100g: 95,
            proteinPer100g: 4,
            fatPer100g: 5,
            carbohydratePer100g: 9
        },
        {
            id: 196,
            name: "かに玉",
            caloriePer100g: 130,
            proteinPer100g: 8,
            fatPer100g: 8,
            carbohydratePer100g: 6
        },
        {
            id: 197,
            name: "棒棒鶏",
            caloriePer100g: 150,
            proteinPer100g: 14,
            fatPer100g: 9,
            carbohydratePer100g: 4
        },
        {
            id: 198,
            name: "油淋鶏",
            caloriePer100g: 240,
            proteinPer100g: 16,
            fatPer100g: 16,
            carbohydratePer100g: 10
        },
        {
            id: 199,
            name: "野菜炒め",
            caloriePer100g: 80,
            proteinPer100g: 3,
            fatPer100g: 5,
            carbohydratePer100g: 7
        },
        {
            id: 200,
            name: "レバニラ炒め",
            caloriePer100g: 140,
            proteinPer100g: 12,
            fatPer100g: 8,
            carbohydratePer100g: 6
        },
        {
            id: 201,
            name: "いなり寿司",
            caloriePer100g: 190,
            proteinPer100g: 4,
            fatPer100g: 5,
            carbohydratePer100g: 32
        },
        {
            id: 202,
            name: "巻き寿司",
            caloriePer100g: 160,
            proteinPer100g: 5,
            fatPer100g: 2,
            carbohydratePer100g: 32
        },
        {
            id: 203,
            name: "握り寿司",
            caloriePer100g: 140,
            proteinPer100g: 12,
            fatPer100g: 1,
            carbohydratePer100g: 24
        },
        {
            id: 204,
            name: "うな重",
            caloriePer100g: 190,
            proteinPer100g: 9,
            fatPer100g: 8,
            carbohydratePer100g: 22
        },
        {
            id: 205,
            name: "海鮮丼",
            caloriePer100g: 160,
            proteinPer100g: 10,
            fatPer100g: 3,
            carbohydratePer100g: 26
        },
        {
            id: 206,
            name: "しょうが焼き",
            caloriePer100g: 230,
            proteinPer100g: 16,
            fatPer100g: 14,
            carbohydratePer100g: 12
        },
        {
            id: 207,
            name: "肉じゃが",
            caloriePer100g: 120,
            proteinPer100g: 6,
            fatPer100g: 5,
            carbohydratePer100g: 15
        },
        {
            id: 208,
            name: "筑前煮",
            caloriePer100g: 100,
            proteinPer100g: 5,
            fatPer100g: 3,
            carbohydratePer100g: 14
        },
        {
            id: 209,
            name: "煮魚",
            caloriePer100g: 110,
            proteinPer100g: 15,
            fatPer100g: 3,
            carbohydratePer100g: 6
        },
        {
            id: 210,
            name: "ぶり大根",
            caloriePer100g: 130,
            proteinPer100g: 12,
            fatPer100g: 6,
            carbohydratePer100g: 8
        },
        {
            id: 211,
            name: "かぼちゃの煮物",
            caloriePer100g: 90,
            proteinPer100g: 1.5,
            fatPer100g: 0.2,
            carbohydratePer100g: 21
        },
        {
            id: 212,
            name: "厚揚げの煮物",
            caloriePer100g: 110,
            proteinPer100g: 7,
            fatPer100g: 6,
            carbohydratePer100g: 8
        },
        {
            id: 213,
            name: "キムチ",
            caloriePer100g: 46,
            proteinPer100g: 2.8,
            fatPer100g: 0.5,
            carbohydratePer100g: 8.3
        },
        {
            id: 214,
            name: "もずく酢",
            caloriePer100g: 20,
            proteinPer100g: 0.3,
            fatPer100g: 0.1,
            carbohydratePer100g: 4.5
        },
        {
            id: 215,
            name: "わかめスープ",
            caloriePer100g: 15,
            proteinPer100g: 1,
            fatPer100g: 0.5,
            carbohydratePer100g: 2
        },
        {
            id: 216,
            name: "コーンスープ",
            caloriePer100g: 70,
            proteinPer100g: 2,
            fatPer100g: 3,
            carbohydratePer100g: 9
        },
        {
            id: 217,
            name: "ミネストローネ",
            caloriePer100g: 60,
            proteinPer100g: 2,
            fatPer100g: 2,
            carbohydratePer100g: 8
        },
        {
            id: 218,
            name: "オニオンスープ",
            caloriePer100g: 40,
            proteinPer100g: 1,
            fatPer100g: 2,
            carbohydratePer100g: 5
        },
        {
            id: 219,
            name: "ケーキ",
            caloriePer100g: 350,
            proteinPer100g: 5,
            fatPer100g: 18,
            carbohydratePer100g: 45
        },
        {
            id: 220,
            name: "アイスクリーム",
            caloriePer100g: 200,
            proteinPer100g: 3.5,
            fatPer100g: 8,
            carbohydratePer100g: 28
        },
        {
            id: 221,
            name: "プリン",
            caloriePer100g: 126,
            proteinPer100g: 5,
            fatPer100g: 5,
            carbohydratePer100g: 15
        },
        {
            id: 222,
            name: "ドーナツ",
            caloriePer100g: 380,
            proteinPer100g: 6,
            fatPer100g: 20,
            carbohydratePer100g: 45
        },
        {
            id: 223,
            name: "クッキー",
            caloriePer100g: 480,
            proteinPer100g: 6,
            fatPer100g: 22,
            carbohydratePer100g: 65
        },
        {
            id: 224,
            name: "チョコレート",
            caloriePer100g: 550,
            proteinPer100g: 7,
            fatPer100g: 34,
            carbohydratePer100g: 55
        },
        {
            id: 225,
            name: "ポップコーン",
            caloriePer100g: 480,
            proteinPer100g: 10,
            fatPer100g: 25,
            carbohydratePer100g: 58
        }
    ]

    await prisma.$transaction(async (tx) => {
        for (const row of rows) {
            await tx.mealMaster.upsert({
                where: { id: row.id },
                update: row,
                create: row
            })
        }
    })
}
