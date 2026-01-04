import { z } from 'zod'

export const monitorSchema = z.object({
  url: z.string().url().max(2048),
  label: z.string().max(100).optional(),
  selector: z.string().min(1).max(200),
  value_type: z.enum(['text', 'price']).default('text'),
  interval_minutes: z.number().refine((val) => [60, 240, 1440].includes(val), {
    message: 'Interval must be 60, 240, or 1440 minutes',
  }),
  notification_email: z.string().email(),
  is_active: z.boolean().default(true),
  cooldown_minutes: z.number().int().min(1).optional().default(60),
})

export const testSelectorSchema = z.object({
  url: z.string().url().max(2048),
  selector: z.string().min(1).max(200),
})

export type MonitorInput = z.infer<typeof monitorSchema>
export type TestSelectorInput = z.infer<typeof testSelectorSchema>
