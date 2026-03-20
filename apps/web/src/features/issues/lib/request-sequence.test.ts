import { describe, expect, it } from 'vitest'
import { createRequestSequence } from './request-sequence'

describe('createRequestSequence', () => {
  it('keeps only the latest request current', () => {
    const sequence = createRequestSequence()

    const firstRequest = sequence.next()
    const secondRequest = sequence.next()

    expect(sequence.isCurrent(firstRequest)).toBe(false)
    expect(sequence.isCurrent(secondRequest)).toBe(true)
  })
})
