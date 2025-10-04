import { createCanvas } from "canvas"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export type WeightPoint = { dateISO: string; weight: number; bmi?: number | null }

export async function renderWeeklyWeightBmiChart(
    points: WeightPoint[],
    opts?: { width?: number; height?: number; title?: string }
): Promise<Buffer> {
    const width = opts?.width ?? 900
    const height = opts?.height ?? 500
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext("2d")

    const labels = points.map((p) =>
        new Date(p.dateISO).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })
    )
    const weightData = points.map((p) => Number(p.weight ?? 0))
    const bmiData = points.map((p) => (p.bmi == null ? null : Number(p.bmi)))

    // eslint-disable-next-line no-new
    new Chart(ctx as unknown as any, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "体重(kg)",
                    data: weightData,
                    borderColor: "#4e79a7",
                    backgroundColor: "rgba(78,121,167,0.15)",
                    tension: 0.25,
                    yAxisID: "y"
                },
                {
                    label: "BMI",
                    data: bmiData as unknown as number[],
                    borderColor: "#f28e2b",
                    backgroundColor: "rgba(242,142,43,0.15)",
                    tension: 0.25,
                    yAxisID: "y1"
                }
            ]
        },
        options: {
            responsive: false,
            plugins: {
                legend: { position: "bottom" },
                title: { display: true, text: opts?.title ?? "1週間の体重/BMI" }
            },
            scales: {
                y: { position: "left", title: { display: true, text: "kg" } },
                y1: { position: "right", grid: { drawOnChartArea: false }, title: { display: true, text: "BMI" } }
            }
        }
    })

    return canvas.toBuffer("image/png")
}
