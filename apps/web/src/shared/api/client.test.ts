import { describe, expect, it, vi } from 'vitest'
import { api } from './client'

describe('api client', () => {
  it('loads dashboard payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ stats: { activeIssues: 1 } }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const result = await api.getDashboard()

    expect(fetchMock).toHaveBeenCalledWith('/api/dashboard')
    expect(result.stats.activeIssues).toBe(1)

    vi.unstubAllGlobals()
  })
})
