/**
 * Independent loan implementation, written for tests only, following the
 * published contract (.team/CONTRACT.md v1). Deliberately does NOT import
 * src/lib/loan.ts so backend math is checked against a separate implementation.
 *
 * All amounts are sample data. Rounding: 2 decimal places, half away from zero.
 */

export type LoanMethod = "simple" | "reducing";

export type LoanInput = {
  principal: number;
  annualRatePercent: number;
  months: number;
  method: LoanMethod;
};

export type ScheduleRow = {
  month: number;
  openingBalance: number;
  payment: number;
  interest: number;
  principal: number;
  closingBalance: number;
};

export type LoanResult = {
  method: LoanMethod;
  principal: number;
  annualRatePercent: number;
  months: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayable: number;
  schedule: ScheduleRow[];
};

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateLoan(input: LoanInput): LoanResult {
  const { principal, annualRatePercent, months, method } = input;

  if (!Number.isFinite(principal) || principal <= 0) {
    throw new RangeError("principal must be a positive finite number");
  }
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    throw new RangeError("annualRatePercent must be zero or positive");
  }
  if (!Number.isInteger(months) || months < 1) {
    throw new RangeError("months must be an integer of at least 1");
  }
  if (method !== "simple" && method !== "reducing") {
    throw new RangeError("method must be simple or reducing");
  }

  const schedule =
    method === "reducing"
      ? reducingSchedule(principal, annualRatePercent, months)
      : simpleSchedule(principal, annualRatePercent, months);

  const totalInterest = round2(
    schedule.reduce((sum, row) => sum + row.interest, 0),
  );
  const totalPayable = round2(
    schedule.reduce((sum, row) => sum + row.payment, 0),
  );

  return {
    method,
    principal,
    annualRatePercent,
    months,
    monthlyPayment: schedule[0].payment,
    totalInterest,
    totalPayable,
    schedule,
  };
}

function reducingSchedule(
  principal: number,
  annualRatePercent: number,
  months: number,
): ScheduleRow[] {
  const r = annualRatePercent / 1200;
  const fixed =
    annualRatePercent === 0
      ? round2(principal / months)
      : round2(
          (principal * r * Math.pow(1 + r, months)) /
            (Math.pow(1 + r, months) - 1),
        );

  const rows: ScheduleRow[] = [];
  let opening = principal;

  for (let month = 1; month <= months; month += 1) {
    const interest = round2(opening * r);
    let principalPaid: number;
    let payment: number;

    if (month === months) {
      principalPaid = opening;
      payment = round2(principalPaid + interest);
    } else {
      principalPaid = round2(fixed - interest);
      if (principalPaid > opening) {
        principalPaid = opening;
        payment = round2(opening + interest);
      } else {
        payment = fixed;
      }
    }

    const closing = round2(opening - principalPaid);
    rows.push({
      month,
      openingBalance: opening,
      payment,
      interest,
      principal: principalPaid,
      closingBalance: closing,
    });
    opening = closing;
  }

  return rows;
}

function simpleSchedule(
  principal: number,
  annualRatePercent: number,
  months: number,
): ScheduleRow[] {
  const totalInterest = round2(
    principal * (annualRatePercent / 100) * (months / 12),
  );
  const baseInterest = round2(totalInterest / months);
  const basePrincipal = round2(principal / months);

  const rows: ScheduleRow[] = [];
  let opening = principal;

  for (let month = 1; month <= months; month += 1) {
    const isLast = month === months;
    const interest = isLast
      ? round2(totalInterest - baseInterest * (months - 1))
      : baseInterest;
    const principalPaid = isLast
      ? round2(principal - basePrincipal * (months - 1))
      : basePrincipal;
    const payment = round2(principalPaid + interest);
    const closing = round2(opening - principalPaid);

    rows.push({
      month,
      openingBalance: opening,
      payment,
      interest,
      principal: principalPaid,
      closingBalance: closing,
    });
    opening = closing;
  }

  return rows;
}
