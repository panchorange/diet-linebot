import { runWeeklyReportForAllUsers } from "../presentation/scheduler/weeklyReportCron"

runWeeklyReportForAllUsers("cloud-run-job")
    .then(() => {
        console.log("Weekly report job finished")
        process.exit(0)
    })
    .catch((err: unknown) => {
        console.error("Weekly report job failed:", err)
        process.exit(1)
    })
