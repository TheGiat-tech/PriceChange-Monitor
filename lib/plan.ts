/**
 * Plan enforcement utilities for server-side validation
 */

export type Plan = 'free' | 'pro'

export interface PlanLimits {
  maxMonitors: number
  minIntervalMinutes: number
}

/**
 * Get the limits for a given plan
 */
export function getPlanLimits(plan: Plan): PlanLimits {
  switch (plan) {
    case 'pro':
      return {
        maxMonitors: 20,
        minIntervalMinutes: 60,
      }
    case 'free':
    default:
      return {
        maxMonitors: 1,
        minIntervalMinutes: 1440,
      }
  }
}

/**
 * Check if user can create a new monitor based on their plan
 */
export function canCreateMonitor(plan: Plan, activeCount: number): boolean {
  const limits = getPlanLimits(plan)
  return activeCount < limits.maxMonitors
}

/**
 * Check if the interval is allowed for the given plan
 */
export function canUseInterval(plan: Plan, intervalMinutes: number): boolean {
  const limits = getPlanLimits(plan)
  return intervalMinutes >= limits.minIntervalMinutes
}

/**
 * Get a user-friendly error message for plan violations
 */
export function getPlanViolationMessage(
  plan: Plan,
  violation: 'monitor_limit' | 'interval_limit'
): string {
  const limits = getPlanLimits(plan)
  
  switch (violation) {
    case 'monitor_limit':
      return `Your ${plan} plan allows a maximum of ${limits.maxMonitors} active monitor${limits.maxMonitors > 1 ? 's' : ''}. Please upgrade to add more monitors.`
    case 'interval_limit':
      return `Your ${plan} plan requires a minimum interval of ${limits.minIntervalMinutes} minutes. Please upgrade to use shorter intervals.`
  }
}
