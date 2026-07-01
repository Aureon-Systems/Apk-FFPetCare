// ─── Cão / Hospedagem ────────────────────────────────────────────────────────

export type DogSize = "Pequeno" | "Médio" | "Grande";

export type ServiceStatus = "Agendado" | "Hospedado" | "Concluído";

export interface Medication {
  id: string;
  name: string;  // nome da medicação
  time: string;  // "HH:MM"
}

export interface DailyTask {
  id: string;
  type: "walk" | "medication";
  label?: string;    // nome da medicação (quando type === "medication")
  time: string;      // "HH:MM"
  doneOn: string[];  // lista de "YYYY-MM-DD" já concluídos
}

export interface Dog {
  id: string;

  // Cão
  photoUrl?: string;
  name: string;
  birthDate?: string; // "YYYY-MM-DD"
  breed?: string;
  size: DogSize;
  food?: string;          // alimentação
  belongings?: string;    // pertences trazidos de casa
  healthNotes?: string;   // comorbidades / observações de saúde
  medications: Medication[];

  // Responsável
  ownerName: string;
  ownerPhone: string;
  ownerCPF?: string;
  ownerAddress?: string;

  // Hospedagem
  checkIn: string;       // "YYYY-MM-DD"
  checkInTime?: string;  // "HH:MM"
  checkOut: string;      // "YYYY-MM-DD"
  checkOutTime?: string; // "HH:MM"
  dailyRate: number;     // R$ por diária (baseado no porte)

  // Adicionais
  vetName?: string;
  vetClinic?: string;

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