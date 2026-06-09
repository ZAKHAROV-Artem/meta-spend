'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/auth'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'
const BASE_PATH = '/api/v1'
const STATUS_PATH = '/auth/extension/status'
const RETRY_DELAY_MS = 3_000
const NO_TOKEN_RETRY_DELAY_MS = 2_000

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('aborted', 'AbortError'))
    const timeout = window.setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      window.clearTimeout(timeout)
      reject(new DOMException('aborted', 'AbortError'))
    })
  })
}

/**
 * Subscribes to the backend's extension-status SSE stream and invalidates the
 * status query the instant a `status-changed` event arrives — giving near-zero-latency
 * connect/disconnect sync without waiting on the polling interval. Uses fetch + manual
 * parsing (rather than EventSource) so the existing Bearer token auth can be reused.
 */
export function useExtensionStatusStream(): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    const controller = new AbortController()

    const readStream = async (): Promise<void> => {
      const token = getAccessToken()
      if (!token) {
        await sleep(NO_TOKEN_RETRY_DELAY_MS, controller.signal)
        return
      }

      const res = await fetch(`${API_URL}${BASE_PATH}${STATUS_PATH}/stream`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
        signal: controller.signal,
      })
      if (!res.ok || !res.body) {
        throw new Error(`extension status stream failed (${res.status})`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      for (;;) {
        const { value, done } = await reader.read()
        if (done) return
        buffer += decoder.decode(value, { stream: true })

        const frames = buffer.split('\n\n')
        buffer = frames.pop() ?? ''
        for (const frame of frames) {
          const dataLine = frame.split('\n').find((line) => line.startsWith('data:'))
          if (!dataLine) continue
          let payload: { type?: string } | null = null
          try {
            payload = JSON.parse(dataLine.slice(5).trim()) as { type?: string }
          } catch {
            continue
          }
          if (payload?.type === 'status-changed') {
            void queryClient.invalidateQueries({ queryKey: [STATUS_PATH] })
          }
        }
      }
    }

    void (async () => {
      while (!controller.signal.aborted) {
        try {
          await readStream()
        } catch (err) {
          if (controller.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) return
        }
        if (controller.signal.aborted) return
        try {
          await sleep(RETRY_DELAY_MS, controller.signal)
        } catch {
          return
        }
      }
    })()

    return () => controller.abort()
  }, [queryClient])
}
