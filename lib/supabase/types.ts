export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EnrollmentStatus = "pending" | "verified" | "self_declared";
export type UserRole = "student" | "admin" | "partner";
export type ConsentPurpose =
  | "cash_flow_assessment"
  | "identity_verification"
  | "account_aggregator_sync"
  | "parent_report_sharing";
export type ConsentStatus = "granted" | "revoked" | "expired";
export type BankConnectionStatus = "active" | "revoked" | "expired" | "failed";
export type UploadStatus = "pending" | "processed" | "failed";
export type TransactionType = "credit" | "debit";
export type InflowQuality = "qualifying" | "round_trip" | "loan_inflow" | "excluded";
export type CreditStateEnum =
  | "ELIGIBILITY"
  | "LINKED"
  | "ASSESSED"
  | "OFFERED"
  | "ACTIVE"
  | "DUE_SOON"
  | "REPAID"
  | "GRADUATED"
  | "LOCKED_SLIP_1"
  | "LOCKED_SLIP_2";

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  institution: string;
  course_program?: string | null;
  graduation_year?: number | null;
  date_of_birth?: string | null;
  enrollment_status: EnrollmentStatus;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  purpose: ConsentPurpose;
  data_categories: string[];
  consent_version: string;
  status: ConsentStatus;
  granted_at: string;
  expires_at: string;
  revoked_at?: string | null;
  created_at: string;
}

export interface BankConnection {
  id: string;
  user_id: string;
  fip_id: string;
  fip_name: string;
  masked_account_number: string;
  consent_handle?: string | null;
  status: BankConnectionStatus;
  linked_at: string;
  last_synced_at?: string | null;
  created_at: string;
}

export interface StatementUpload {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size_bytes?: number | null;
  mime_type?: string | null;
  status: UploadStatus;
  parsed_transaction_count: number;
  date_range_start?: string | null;
  date_range_end?: string | null;
  uploaded_at: string;
}

export interface TransactionRecord {
  id: string;
  user_id: string;
  statement_id?: string | null;
  date: string;
  narration: string;
  amount_paise: number;
  type: TransactionType;
  balance_paise: number;
  category?: string | null;
  is_recurring: boolean;
  inflow_quality?: InflowQuality | null;
  hash: string;
  created_at: string;
}

export interface FinancialAnalysis {
  id: string;
  user_id: string;
  coverage_months: number;
  median_monthly_income_paise: number;
  income_volatility_score: number;
  fixed_obligations_paise: number;
  capacity_cap_paise: number;
  stress_cap_paise: number;
  tier_cap_paise: number;
  final_limit_paise: number;
  binding_cap: string;
  is_eligible: boolean;
  rejection_reason?: string | null;
  computed_at: string;
}

export interface CreditSimulation {
  id: string;
  user_id: string;
  scenario_name: string;
  simulated_limit_paise: number;
  simulated_buffer_paise: number;
  passed: boolean;
  details: Record<string, any>;
  run_at: string;
}

export interface RepaymentRecord {
  id: string;
  user_id: string;
  cycle_number: number;
  principal_paise: number;
  fee_paise: number;
  total_paid_paise: number;
  due_date: string;
  paid_at?: string | null;
  status: "pending" | "paid_on_time" | "paid_late" | "defaulted";
  reported_to_bureau: boolean;
  created_at: string;
}

export interface ReportShare {
  id: string;
  user_id: string;
  recipient_label: string;
  share_token: string;
  is_revoked: boolean;
  created_at: string;
  expires_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string; display_name: string; institution: string };
        Update: Partial<Profile>;
      };
      consents: {
        Row: ConsentRecord;
        Insert: Partial<ConsentRecord> & { user_id: string; purpose: ConsentPurpose; data_categories: string[]; expires_at: string };
        Update: Partial<ConsentRecord>;
      };
      bank_connections: {
        Row: BankConnection;
        Insert: Partial<BankConnection> & { user_id: string; fip_id: string; fip_name: string; masked_account_number: string };
        Update: Partial<BankConnection>;
      };
      statement_uploads: {
        Row: StatementUpload;
        Insert: Partial<StatementUpload> & { user_id: string; file_name: string; file_path: string };
        Update: Partial<StatementUpload>;
      };
      transactions: {
        Row: TransactionRecord;
        Insert: Partial<TransactionRecord> & { user_id: string; date: string; narration: string; amount_paise: number; type: TransactionType; balance_paise: number; hash: string };
        Update: Partial<TransactionRecord>;
      };
      financial_analyses: {
        Row: FinancialAnalysis;
        Insert: Partial<FinancialAnalysis> & { user_id: string };
        Update: Partial<FinancialAnalysis>;
      };
      credit_simulations: {
        Row: CreditSimulation;
        Insert: Partial<CreditSimulation> & { user_id: string; scenario_name: string; simulated_limit_paise: number; simulated_buffer_paise: number; passed: boolean };
        Update: Partial<CreditSimulation>;
      };
      repayment_records: {
        Row: RepaymentRecord;
        Insert: Partial<RepaymentRecord> & { user_id: string; cycle_number: number; principal_paise: number; fee_paise: number; total_paid_paise: number; due_date: string };
        Update: Partial<RepaymentRecord>;
      };
      report_shares: {
        Row: ReportShare;
        Insert: Partial<ReportShare> & { user_id: string; recipient_label: string; share_token: string; expires_at: string };
        Update: Partial<ReportShare>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Partial<AuditLog> & { action: string; entity_type: string };
        Update: Partial<AuditLog>;
      };
    };
  };
}
