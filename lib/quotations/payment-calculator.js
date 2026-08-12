/**
 * Sistema Francés (cuota constante) — calculadora de financiación
 */
export function calculateFrenchSystem(principalUSD, annualRatePct, installments, downPaymentPct = 30) {
  const downPayment = principalUSD * (downPaymentPct / 100);
  const financedAmount = principalUSD - downPayment;
  const monthlyRate = annualRatePct / 100 / 12;

  const installmentAmount = monthlyRate === 0
    ? financedAmount / installments
    : (financedAmount * monthlyRate * Math.pow(1 + monthlyRate, installments)) /
      (Math.pow(1 + monthlyRate, installments) - 1);

  const schedule = [];
  let balance = financedAmount;

  for (let i = 1; i <= installments; i++) {
    const interest = balance * monthlyRate;
    const principal = installmentAmount - interest;
    balance -= principal;
    schedule.push({
      month: i,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100),
    });
  }

  const totalPaid = installmentAmount * installments + downPayment;
  const totalInterest = totalPaid - principalUSD;

  return {
    downPayment: Math.round(downPayment),
    downPaymentPct,
    installmentAmount: Math.round(installmentAmount),
    totalInterest: Math.round(totalInterest),
    totalPaid: Math.round(totalPaid),
    installments,
    annualRate: annualRatePct,
    schedule,
  };
}
