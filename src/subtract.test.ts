// subtract.test.ts

import { subtract } from './subtract'

describe('subtract', () => {
  test('should subtract two positive numbers correctly', () => {
    expect(subtract(5, 3)).toBe(2)
  })

  test('should subtract a negative number correctly', () => {
    expect(subtract(5, -3)).toBe(8)
  })

  test('should subtract two negative numbers correctly', () => {
    expect(subtract(-5, -3)).toBe(-2)
  })

  test('should subtract zero correctly', () => {
    expect(subtract(5, 0)).toBe(5)
    expect(subtract(0, 5)).toBe(-5)
  })

  test('should handle decimal numbers', () => {
    expect(subtract(5.5, 2.2)).toBeCloseTo(3.3)
  })

  test('should return zero when subtracting same numbers', () => {
    expect(subtract(5, 5)).toBe(0)
  })
})
