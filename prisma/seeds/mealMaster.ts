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
        { id: 27, name: "冷奴", caloriePer100g: 80, proteinPer100g: 7, fatPer100g: 4, carbohydratePer100g: 3 },
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
        { id: 35, name: "豚汁", caloriePer100g: 80, proteinPer100g: 5, fatPer100g: 4, carbohydratePer100g: 7 },
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
