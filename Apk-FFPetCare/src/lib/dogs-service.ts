import { supabase } from "./supabase";
import { Dog, DailyTask, DogSize } from "./types";

const TABLE = "hospedagem"; // confirme se o nome da tabela é exatamente esse

interface HospedagemRow {
  HospId: number;
  nomeDog: string;
  dono: string;
  telDono: number | null;
  porte: string;
  entrada: string;
  saida: string;
  diaria: number;
  horaPasseio: string | null;
  horaMedic: string | null;
  obs: string | null;
}

function rowToDog(row: HospedagemRow): Dog {
  const tasks: DailyTask[] = [];
  if (row.horaPasseio) {
    tasks.push({ id: `walk_${row.HospId}`, type: "walk", time: row.horaPasseio.slice(0, 5), doneOn: [] });
  }
  if (row.horaMedic) {
    tasks.push({ id: `med_${row.HospId}`, type: "medication", time: row.horaMedic.slice(0, 5), doneOn: [] });
  }
  return {
    id: String(row.HospId),
    name: row.nomeDog,
    ownerName: row.dono,
    ownerPhone: row.telDono != null ? String(row.telDono) : "",
    size: row.porte as DogSize,
    checkIn: row.entrada,
    checkOut: row.saida,
    dailyRate: row.diaria,
    tasks,
    notes: row.obs ?? "",
  };
}

function dogToRow(dog: Dog) {
  const walk = dog.tasks.find((t) => t.type === "walk");
  const med = dog.tasks.find((t) => t.type === "medication");
  const phoneDigits = dog.ownerPhone.replace(/\D/g, "");
  return {
    nomeDog: dog.name,
    dono: dog.ownerName,
    telDono: phoneDigits ? Number(phoneDigits) : null,
    porte: dog.size,
    entrada: dog.checkIn,
    saida: dog.checkOut,
    diaria: dog.dailyRate,
    horaPasseio: walk ? walk.time : null,
    horaMedic: med ? med.time : null,
    obs: dog.notes || null,
  };
}

export async function loadDogs(): Promise<Dog[]> {
  const { data, error } = await supabase.from(TABLE).select("*").order("entrada", { ascending: true });
  if (error) {
    console.error("Erro ao carregar hospedagens:", error.message);
    return [];
  }
  return (data as HospedagemRow[]).map(rowToDog);
}

export async function insertDog(dog: Dog): Promise<Dog | null> {
  const { data, error } = await supabase.from(TABLE).insert(dogToRow(dog)).select().single();
  if (error) {
    console.error("Erro ao salvar hospedagem:", error.message);
    return null;
  }
  return rowToDog(data as HospedagemRow);
}

export async function removeDog(id: string): Promise<boolean> {
  const { error } = await supabase.from(TABLE).delete().eq("HospId", Number(id));
  if (error) {
    console.error("Erro ao remover hospedagem:", error.message);
    return false;
  }
  return true;
}