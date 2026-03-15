export interface Transaction {
    date: string; // YYYY-MM-DD
    amount: number;
}

export interface SimulationRequest {
    initial_balance: number;
    start_date: string;
    end_date: string;
    transactions: Transaction[];
}

export interface DailyBreakdown {
    date: string;
    beginning_balance: number;
    deposits: number;
    withdrawals: number;
    daily_interest_accrued: number;
    ending_balance: number;
}

export interface AccountingRecord {
    debit_account: string | null;
    credit_account: string | null;
    amount: number;
    description: string;
}

export interface SimulationResult {
    total_interest: number;
    tax_amount: number;
    net_interest: number;
    daily_breakdown: DailyBreakdown[];
    accounting_records: AccountingRecord[];
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}
