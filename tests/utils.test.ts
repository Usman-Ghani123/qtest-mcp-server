import { describe, it, expect } from 'vitest'
import { parsePid } from '@/utils.js'

describe('parsePid', () => {
  it('parses MD- prefix', () => expect(parsePid('MD-448')).toBe(448))
  it('parses CL- prefix', () => expect(parsePid('CL-710')).toBe(710))
  it('parses TC- prefix', () => expect(parsePid('TC-1')).toBe(1))
  it('throws on non-numeric suffix', () => {
    expect(() => parsePid('MD-abc')).toThrow('Invalid pid format: "MD-abc"')
  })
  it('throws on empty suffix', () => {
    expect(() => parsePid('MD-')).toThrow('Invalid pid format: "MD-"')
  })
})
