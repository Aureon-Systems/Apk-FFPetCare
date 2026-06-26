// ─── Cão / Hospedagem ────────────────────────────────────────────────────────

export type DogSize = "Pequeno" | "Médio" | "Grande";

export interface DailyTask {
  id: string;
  type: "walk" | "medication";
  time: string;      // "HH:MM"
  doneOn: string[];  // lista de "YYYY-MM-DD" já concluídos
}

export interface Dog {
  id: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  size: DogSize;
  checkIn: string;   // "YYYY-MM-DD"
  checkOut: string;  // "YYYY-MM-DD"
  dailyRate: number; // R$ por diária (baseado no porte)
  tasks: DailyTask[];
  notes: string;
}

// ─── Configurações ────────────────────────────────────────────────────────────

export interface AppSettings {
  maxCapacity: number;
  rateSmall: number;
  rateMedium: number;
  rateLarge: number;
  pixKey: string;
  phone: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  maxCapacity: 6,
  rateSmall: 50,
  rateMedium: 70,
  rateLarge: 90,
  pixKey: "",
  phone: "",
};