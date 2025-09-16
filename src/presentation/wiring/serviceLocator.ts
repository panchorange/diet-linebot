// 役割: 依存解決（UserService と Exercise Service の組み立て）

import { exerciseService } from "../../domain/services/exerciseAdvice"
import { exerciseWeeklyReportService } from "../../domain/services/exerciseWeeklyReportService"
import { UserService } from "../../domain/services/userService"
import { weightAdviceService } from "../../domain/services/weightAdvice"
import { PrismaUserRepository } from "../../infrastructure/prisma/repositories/PrismaUserRepository"

const userRepository = new PrismaUserRepository()
export const userService = new UserService(userRepository)

export { exerciseService, exerciseWeeklyReportService, weightAdviceService }
