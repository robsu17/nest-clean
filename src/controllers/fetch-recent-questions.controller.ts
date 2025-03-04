import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { z } from 'zod'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const perPageQueryParamSchema = z
  .string()
  .optional()
  .default('10')
  .transform(Number)
  .pipe(z.number().min(1))

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type PerPageQueryParamSchema = z.infer<typeof perPageQueryParamSchema>

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)
const perPageQueryvalidationPipe = new ZodValidationPipe(
  perPageQueryParamSchema,
)

@Controller('/questions')
@UseGuards(AuthGuard('jwt'))
export class FetchRecentQuestionsController {
  constructor(private prismaService: PrismaService) {}

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    @Query('perPage', perPageQueryvalidationPipe)
    perPage: PerPageQueryParamSchema,
  ) {
    const total = await this.prismaService.question.count()
    const questions = await this.prismaService.question.findMany({
      take: perPage,
      skip: Math.abs(page - 1) * perPage,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      page,
      total,
      perPage,
      data: questions,
    }
  }
}
