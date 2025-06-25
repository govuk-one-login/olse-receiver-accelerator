// add.test.ts

import { add } from './add'

describe('add function', () => {
  test('adds two positive numbers correctly', () => {
    expect(add(2, 3)).toBe(5)
  })

  test('adds a positive and negative number correctly', () => {
    expect(add(5, -3)).toBe(2)
  })

  test('adds two negative numbers correctly', () => {
    expect(add(-2, -4)).toBe(-6)
  })

  test('adds zero correctly', () => {
    expect(add(0, 5)).toBe(5)
    expect(add(5, 0)).toBe(5)
    expect(add(0, 0)).toBe(0)
  })

  test('adds decimal numbers correctly', () => {
    expect(add(0.1, 0.2)).toBeCloseTo(0.3)
    expect(add(1.5, 2.7)).toBeCloseTo(4.2)
  })
})
