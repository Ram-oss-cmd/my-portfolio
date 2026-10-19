export type LoanMethod = "simple" | "reducing";

export type LoanInput = {
  principal: number;
  annualRatePercent: number;
  months: number;
  method: LoanMethod;
};

export type LoanScheduleRow = {
  month: number;
  openingBalance: number;
  payment: number;
  interest: number;
  principal: number;
  closingBalance: number;
};

export type LoanEstimate = {
  method: LoanMethod;
  principal: number;
  annualRatePercent: number;
  months: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayable: number;
  schedule: LoanScheduleRow[];
};

/** Money rounds half away from zero to 2 decimals; Number.EPSILON avoids 1.005 -> 1.00. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function estimateLoan(input: LoanInput): LoanEstimate {
  const { principal, annualRatePercent, months, method } = input;
  if (
    !Number.isFinite(principal) ||
    principal <= 0 ||
    !Number.isFinite(annualRatePercent) ||
    annualRatePercent < 0 ||
    !Number.isInteger(months) ||
    months < 1
  ) {
    throw new RangeError("Invalid loan input");
  }

  const schedule =
    method === "reducing"
      ? reducingSchedule(principal, annualRatePercent, months)
      : simpleSchedule(principal, annualRatePercent, months);

  const totalInterest = round2(schedule.reduce((sum, row) => sum + row.interest, 0));
  const totalPayable = round2(schedule.reduce((sum, row) => sum + row.payment, 0));

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
): LoanScheduleRow[] {
  const monthlyRate = annualRatePercent / 1200;
  const fixed =
    monthlyRate === 0
      ? round2(principal / months)
      : round2(
          (principal * monthlyRate * (1 + monthlyRate) ** months) /
            ((1 + monthlyRate) ** months - 1),
        );

  const rows: LoanScheduleRow[] = [];
  let balance = round2(principal);

  for (let month = 1; month <= months; month += 1) {
    const openingBalance = balance;
    const interest = round2(openingBalance * monthlyRate);
    let payment: number;
    let principalPart: number;

    if (month === months) {
      principalPart = openingBalance;
      payment = round2(principalPart + interest);
    } else {
      payment = fixed;
      principalPart = round2(payment - interest);
      if (principalPart > openingBalance) {
        principalPart = openingBalance;
        payment = round2(principalPart + interest);
      }
    }

    balance = round2(openingBalance - principalPart);
    rows.push({ month, openingBalance, payment, interest, principal: principalPart, closingBalance: balance });
  }

  return rows;
}

function simpleSchedule(
  principal: number,
  annualRatePercent: number,
  months: number,
): LoanScheduleRow[] {
  const totalInterest = round2(principal * (annualRatePercent / 100) * (months / 12));
  const baseInterest = round2(totalInterest / months);
  const basePrincipal = round2(principal / months);

  const rows: LoanScheduleRow[] = [];
  let balance = round2(principal);

  for (let month = 1; month <= months; month += 1) {
    const openingBalance = balance;
    const isLast = month === months;
    const interest = isLast ? round2(totalInterest - baseInterest * (months - 1)) : baseInterest;
    const principalPart = isLast
      ? round2(principal - basePrincipal * (months - 1))
      : basePrincipal;
    const payment = round2(principalPart + interest);

    balance = round2(openingBalance - principalPart);
    rows.push({ month, openingBalance, payment, interest, principal: principalPart, closingBalance: balance });
  }

  return rows;
}
