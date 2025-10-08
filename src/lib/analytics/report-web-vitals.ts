import type { NextWebVitalsMetric } from 'next/app'

const roundToFourDecimals = (value: number) => Math.round(value * 10000) / 10000

export const sendToAnalytics = (metric: NextWebVitalsMetric) => {
  if (typeof window === 'undefined') {
    return
  }

  const value = metric.name === 'CLS' ? metric.value * 1000 : metric.value

  if (typeof window.gtag === 'function') {
    window.gtag('event', metric.name, {
      value: roundToFourDecimals(value),
      event_category: metric.label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
      event_label: metric.id,
      non_interaction: true,
    })
    return
  }

  if (typeof window !== 'undefined' && 'dataLayer' in window) {
    ;(window.dataLayer as unknown[]).push({
      event: 'web-vitals',
      metric_id: metric.id,
      metric_name: metric.name,
      metric_label: metric.label,
      metric_value: roundToFourDecimals(value),
    })
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}
