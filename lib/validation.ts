import { parseISO, isAfter, isBefore, isValid } from "date-fns";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateAmount(amount: string | number): ValidationResult {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: "Please enter a valid number" };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, error: "Amount must be greater than zero" };
  }
  
  return { isValid: true };
}

export function validateInitialBalance(balance: string | number): ValidationResult {
  const numBalance = typeof balance === "string" ? parseFloat(balance) : balance;
  
  if (isNaN(numBalance)) {
    return { isValid: false, error: "Please enter a valid balance" };
  }
  
  if (numBalance < 0) {
    return { isValid: false, error: "Balance cannot be negative" };
  }
  
  return { isValid: true };
}

export function validateDateRange(startDate: string, endDate: string): ValidationResult {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (!isValid(start) || !isValid(end)) {
      return { isValid: false, error: "Please enter valid dates" };
    }
    
    if (!isBefore(start, end)) {
      return { isValid: false, error: "Start date must be before end date" };
    }
    
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      return { isValid: false, error: "Date range cannot exceed 365 days" };
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid date format" };
  }
}

export function validateTransactionDate(
  transactionDate: string,
  startDate: string,
  endDate: string
): ValidationResult {
  try {
    const txDate = parseISO(transactionDate);
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (!isValid(txDate)) {
      return { isValid: false, error: "Please enter a valid date" };
    }
    
    if (isBefore(txDate, start)) {
      return { isValid: false, error: "Transaction date must be after simulation start date" };
    }
    
    if (isAfter(txDate, end)) {
      return { isValid: false, error: "Transaction date must be before simulation end date" };
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid date format" };
  }
}

export function validateRequiredField(value: string | number | null | undefined): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, error: "This field is required" };
  }
  
  return { isValid: true };
}

export function validateAccountId(accountId: string | number | null | undefined): ValidationResult {
  if (!accountId) {
    return { isValid: false, error: "Please select an account" };
  }
  
  return { isValid: true };
}

export interface Transaction {
  date: string;
  amount: number;
  type: "deposit" | "withdrawal";
}

export function validateTransaction(
  transaction: Transaction,
  startDate: string,
  endDate: string
): ValidationResult {
  const amountValidation = validateAmount(transaction.amount);
  if (!amountValidation.isValid) {
    return amountValidation;
  }
  
  const dateValidation = validateTransactionDate(transaction.date, startDate, endDate);
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  return { isValid: true };
}

export function validateTransactions(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): ValidationResult {
  for (let i = 0; i < transactions.length; i++) {
    const validation = validateTransaction(transactions[i], startDate, endDate);
    if (!validation.isValid) {
      return { 
        isValid: false, 
        error: `Transaction ${i + 1}: ${validation.error}` 
      };
    }
  }
  
  return { isValid: true };
}
