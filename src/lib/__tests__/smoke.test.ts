import { harnessReady } from '@/lib/smoke'

describe('test harness', () => {
  it('runs a passing test', () => {
    expect(harnessReady()).toBe(true)
  })
})
