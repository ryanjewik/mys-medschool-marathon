// Shapes returned by the Lambda (GET /api/schools) and by Terraform's /config.json.

export interface School {
  id: string;
  name: string;
  sort_order: number;
  done: boolean;
  interview_date?: string; // "YYYY-MM-DD"
  done_at?: string | null; // ISO timestamp, set when checked off
}

export interface AppConfig {
  herName?: string;
  finalMessage?: string;
}
