import { File } from "expo-file-system";
import { supabase } from "./supabase";
import { Dog, DailyTask, Medication, DogSize } from "./types";

const TABLE = "hospedagem"; // confirme se o nome da tabela é exatamente esse
const PHOTOS_BUCKET = "dog-photos"; // bucket público no Supabase Storage

interface MedicacaoJson {
  id?: string;
  nome: string;
  horario: string;
}

interface HospedagemRow {
  HospId: number;
  // cão
  fotoUrl: string | null;
  nomeDog: string;
  dataNasc: string | null;
  raca: string | null;
  porte: string;
  alimentacao: string | null;
  pertences: string | null;
  comorbidades: string | null;
  medicacoes: MedicacaoJson[] | null;
  // responsável
  dono: string;
  telDono: string | null;
  cpfDono: string | null;
  enderecoDono: string | null;
  // hospedagem
  entrada: string;
  horaEntrada: string | null;
  saida: string;
  horaSaida: string | null;
  diaria: number;
  // adicionais
  veterinario: string | null;
  clinicaVet: string | null;
  // legado (passeio diário) + observações
  horaPasseio: string | null;
  obs: string | null;
  // progresso das tarefas diárias: { [taskId]: ["YYYY-MM-DD", ...] }
  progresso: Record<string, string[]> | null;
}

function rowToDog(row: HospedagemRow): Dog {
  const progresso = row.progresso ?? {};
  const medications: Medication[] = (row.medicacoes ?? []).map((m, i) => ({
    id: m.id ?? `med_${row.HospId}_${i}`,
    name: m.nome,
    time: (m.horario ?? "").slice(0, 5),
  }));

  const tasks: DailyTask[] = [];
  if (row.horaPasseio) {
    const walkId = `walk_${row.HospId}`;
    tasks.push({ id: walkId, type: "walk", time: row.horaPasseio.slice(0, 5), doneOn: progresso[walkId] ?? [] });
  }
  medications.forEach((m) => {
    const taskId = `med_${m.id}`;
    tasks.push({ id: taskId, type: "medication", label: m.name, time: m.time, doneOn: progresso[taskId] ?? [] });
  });

  return {
    id: String(row.HospId),
    photoUrl: row.fotoUrl ?? undefined,
    name: row.nomeDog,
    birthDate: row.dataNasc ?? undefined,
    breed: row.raca ?? undefined,
    size: row.porte as DogSize,
    food: row.alimentacao ?? undefined,
    belongings: row.pertences ?? undefined,
    healthNotes: row.comorbidades ?? undefined,
    medications,
    ownerName: row.dono,
    ownerPhone: row.telDono ?? "",
    ownerCPF: row.cpfDono ?? undefined,
    ownerAddress: row.enderecoDono ?? undefined,
    checkIn: row.entrada,
    checkInTime: row.horaEntrada ? row.horaEntrada.slice(0, 5) : undefined,
    checkOut: row.saida,
    checkOutTime: row.horaSaida ? row.horaSaida.slice(0, 5) : undefined,
    dailyRate: row.diaria,
    vetName: row.veterinario ?? undefined,
    vetClinic: row.clinicaVet ?? undefined,
    tasks,
    notes: row.obs ?? "",
  };
}

function dogToRow(dog: Dog) {
  const walk = dog.tasks.find((t) => t.type === "walk");
  const medicacoes: MedicacaoJson[] = dog.medications.map((m) => ({
    id: m.id,
    nome: m.name,
    horario: m.time,
  }));
  const progresso: Record<string, string[]> = {};
  dog.tasks.forEach((t) => { progresso[t.id] = t.doneOn; });

  return {
    fotoUrl: dog.photoUrl || null,
    nomeDog: dog.name,
    dataNasc: dog.birthDate || null,
    raca: dog.breed || null,
    porte: dog.size,
    alimentacao: dog.food || null,
    pertences: dog.belongings || null,
    comorbidades: dog.healthNotes || null,
    medicacoes,
    dono: dog.ownerName,
    telDono: dog.ownerPhone || null,
    cpfDono: dog.ownerCPF || null,
    enderecoDono: dog.ownerAddress || null,
    entrada: dog.checkIn,
    horaEntrada: dog.checkInTime || null,
    saida: dog.checkOut,
    horaSaida: dog.checkOutTime || null,
    diaria: dog.dailyRate,
    veterinario: dog.vetName || null,
    clinicaVet: dog.vetClinic || null,
    horaPasseio: walk ? walk.time : null,
    obs: dog.notes || null,
    progresso,
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

export async function updateDog(dog: Dog): Promise<Dog | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(dogToRow(dog))
    .eq("HospId", Number(dog.id))
    .select()
    .single();
  if (error) {
    console.error("Erro ao atualizar hospedagem:", error.message);
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

/**
 * Faz upload da foto do cão para o Supabase Storage e retorna a URL pública.
 * `localUri` é o caminho do arquivo retornado pelo expo-image-picker.
 */
export async function uploadDogPhoto(localUri: string): Promise<string | null> {
  try {
    const ext = localUri.split(".").pop()?.toLowerCase() || "jpg";
    const path = `dogs/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await new File(localUri).bytes();
    const contentType = ext === "png" ? "image/png" : "image/jpeg";

    const { error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(path, bytes, { contentType, upsert: true });

    if (error) {
      console.error("Erro ao enviar foto:", error.message);
      return null;
    }

    const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error("Erro ao processar foto:", err);
    return null;
  }
}