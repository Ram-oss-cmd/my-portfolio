import { describe, expect, it } from "vitest";
import { calculateLoan, round2 } from "../support/loan-math";

/**
 * Independent loan-math checks. Every figure below is SAMPLE DATA,
 * not client data. The oracle in tests/support/loan-math.ts is a separate
 * implementation of .team/CONTRACT.md, not an import of src/lib/loan.ts.
 */
describe("independent loan math (sample data)", () => {
  it("reducing, zero interest: principal is split evenly across months", () => {
    const result = calculateLoan({
      principal: 120_000,
      annualRatePercent: 0,
      months: 12,
      method: "reducing",
    });

    expect(result.monthlyPayment).toBe(10_000);
    expect(result.totalPayable).toBe(120_000);
    expect(result.totalInterest).toBe(0);
    expect(result.schedule).toHaveLength(12);
    expect(result.schedule.at(-1)?.closingBalance).toBe(0);
  });

  it("reducing, one month: payment is principal plus one month of interest", () => {
    const result = calculateLoan({
      principal: 100_000,
      annualRatePercent: 12,
      months: 1,
      method: "reducing",
    });

    expect(result.monthlyPayment).toBe(101_000);
    expect(result.totalInterest).toBe(1_000);
    expect(result.schedule[0].principal).toBe(100_000);
    expect(result.schedule[0].closingBalance).toBe(0);
  });

  it("reducing, large principal: 10,000,000 at 10.5% over 240 months", () => {
    const result = calculateLoan({
      principal: 10_000_000,
      annualRatePercent: 10.5,
      months: 240,
      method: "reducing",
    });

    expect(result.monthlyPayment).toBe(99_837.99);
    expect(result.totalInterest).toBe(13_961_116.58);
    expect(result.totalPayable).toBe(23_961_116.58);
    expect(result.schedule).toHaveLength(240);
    expect(result.schedule.at(-1)?.closingBalance).toBe(0);
  });

  it("reducing balance costs less than flat interest", () => {
    const result = calculateLoan({
      principal: 100_000,
      annualRatePercent: 12,
      months: 12,
      method: "reducing",
    });
    const flatInterest = 100_000 * 0.12;

    expect(result.monthlyPayment).toBe(8_884.88);
    expect(result.totalInterest).toBe(6_618.53);
    expect(result.totalInterest).toBeLessThan(flatInterest);
  });

  it("rounds to 2 decimals and keeps the schedule internally consistent", () => {
    const result = calculateLoan({
      principal: 1_000,
      annualRatePercent: 10,
      months: 3,
      method: "reducing",
    });

    expect(result.monthlyPayment).toBe(338.9);
    expect(result.totalInterest).toBe(16.71);
    for (const row of result.schedule) {
      for (const value of Object.values(row)) {
        expect(value).toBe(round2(value));
      }
    }
    expect(result.schedule.at(-1)?.closingBalance).toBe(0);
  });

  it("schedule principal payments sum back to the principal", () => {
    const principal = 1_000_000;
    const { schedule } = calculateLoan({
      principal,
      annualRatePercent: 12,
      months: 24,
      method: "reducing",
    });
    const principalPaid = schedule.reduce((sum, row) => sum + row.principal, 0);

    expect(principalPaid).toBeCloseTo(principal, 2);
    expect(schedule.at(-1)?.closingBalance).toBe(0);
  });

  it("matches contract worked example A (simple, sample data)", () => {
    const result = calculateLoan({
      principal: 250_000,
      annualRatePercent: 12.5,
      months: 24,
      method: "simple",
    });

    expect(result.monthlyPayment).toBe(13_020.84);
    expect(result.totalInterest).toBe(62_500);
    expect(result.totalPayable).toBe(312_500);
    expect(result.schedule[0]).toEqual({
      month: 1,
      openingBalance: 250_000,
      payment: 13_020.84,
      interest: 2_604.17,
      principal: 10_416.67,
      closingBalance: 239_583.33,
    });
    expect(result.schedule.at(-1)).toEqual({
      month: 24,
      openingBalance: 10_416.59,
      payment: 13_020.68,
      interest: 2_604.09,
      principal: 10_416.59,
      closingBalance: 0,
    });
  });

  it("matches contract worked example B (reducing, sample data)", () => {
    const result = calculateLoan({
      principal: 250_000,
      annualRatePercent: 12.5,
      months: 24,
      method: "reducing",
    });

    expect(result.monthlyPayment).toBe(11_826.83);
    expect(result.totalInterest).toBe(33_843.87);
    expect(result.totalPayable).toBe(283_843.87);
    expect(result.schedule[0]).toEqual({
      month: 1,
      openingBalance: 250_000,
      payment: 11_826.83,
      interest: 2_604.17,
      principal: 9_222.66,
      closingBalance: 240_777.34,
    });
    expect(result.schedule[1].closingBalance).toBe(231_458.61);
    expect(result.schedule[2].closingBalance).toBe(222_042.81);
    expect(result.schedule.at(-1)).toEqual({
      month: 24,
      openingBalance: 11_704.85,
      payment: 11_826.78,
      interest: 121.93,
      principal: 11_704.85,
      closingBalance: 0,
    });
  });

  it("matches contract worked example C (zero interest, sample data)", () => {
    const result = calculateLoan({
      principal: 250_000,
      annualRatePercent: 0,
      months: 24,
      method: "reducing",
    });

    expect(result.monthlyPayment).toBe(10_416.67);
    expect(result.schedule.every((row) => row.interest === 0)).toBe(true);
    expect(result.totalPayable).toBe(250_000);
    expect(result.schedule.at(-1)?.payment).toBe(10_416.59);
    expect(result.schedule.at(-1)?.closingBalance).toBe(0);
  });

  it("rejects invalid inputs", () => {
    expect(() =>
      calculateLoan({
        principal: 0,
        annualRatePercent: 10,
        months: 12,
        method: "reducing",
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateLoan({
        principal: 1000,
        annualRatePercent: -1,
        months: 12,
        method: "reducing",
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateLoan({
        principal: 1000,
        annualRatePercent: 10,
        months: 0,
        method: "reducing",
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateLoan({
        principal: 1000,
        annualRatePercent: 10,
        months: 1.5,
        method: "reducing",
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateLoan({
        principal: Number.NaN,
        annualRatePercent: 10,
        months: 12,
        method: "reducing",
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateLoan({
        principal: 1000,
        annualRatePercent: 10,
        months: 12,
        method: "flat" as never,
      }),
    ).toThrow(RangeError);
  });
});
