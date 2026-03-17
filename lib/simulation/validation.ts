export function validateInputs(initial: number, monthly: number, years: number, annualPct: number) {
  const errors: string[] = []

  if (initial < 0) errors.push("Capitalul initial nu poate fi negativ")
  if (initial > 1_000_000) errors.push("Capitalul initial pare prea mare (max EUR1M)")
  if (monthly < 0) errors.push("Contributia lunara nu poate fi negativa")
  if (monthly > 50_000) errors.push("Contributia lunara pare prea mare (max EUR50k)")
  if (years < 1 || years > 50) errors.push("Durata trebuie sa fie intre 1-50 ani")
  if (annualPct < -50 || annualPct > 50) {
    errors.push("Randamentul trebuie sa fie intre -50% si 50%")
  }

  return errors
}
