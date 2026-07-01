-- ============================================================================
-- FFPetCare — Migração: campos completos da Routine Page
-- Rode este script no SQL Editor do Supabase (Project > SQL Editor > New query)
-- ============================================================================

-- 1. Garante que telDono seja texto (telefone formatado, pode ter zero à esquerda)
alter table public.hospedagem
  alter column "telDono" type text using "telDono"::text;

-- 2. Novos campos do cão
alter table public.hospedagem
  add column if not exists "fotoUrl"      text,
  add column if not exists "dataNasc"     date,
  add column if not exists "raca"         text,
  add column if not exists "alimentacao"  text,
  add column if not exists "pertences"    text,
  add column if not exists "comorbidades" text,
  add column if not exists "medicacoes"   jsonb default '[]'::jsonb;

-- 3. Novos campos do responsável
alter table public.hospedagem
  add column if not exists "cpfDono"       text,
  add column if not exists "enderecoDono"  text;

-- 4. Horários de entrada/saída (além das datas já existentes)
alter table public.hospedagem
  add column if not exists "horaEntrada" text,
  add column if not exists "horaSaida"   text;

-- 5. Veterinário responsável
alter table public.hospedagem
  add column if not exists "veterinario" text,
  add column if not exists "clinicaVet"  text;

-- 6. Progresso das tarefas diárias (passeio/medicação marcados como feitos)
alter table public.hospedagem
  add column if not exists "progresso" jsonb default '{}'::jsonb;

-- ============================================================================
-- Storage: bucket público para fotos dos cães
-- ============================================================================
-- Crie manualmente em Storage > New bucket:
--   nome: dog-photos
--   público: sim
--
-- Ou via SQL (requer permissão de owner do projeto):
insert into storage.buckets (id, name, public)
values ('dog-photos', 'dog-photos', true)
on conflict (id) do nothing;

-- Política de leitura pública das fotos
create policy if not exists "Public read dog photos"
on storage.objects for select
using (bucket_id = 'dog-photos');

-- Política de upload para usuários autenticados (o app usa apenas o login do Felipe)
create policy if not exists "Authenticated upload dog photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'dog-photos');

create policy if not exists "Authenticated update dog photos"
on storage.objects for update
to authenticated
using (bucket_id = 'dog-photos');