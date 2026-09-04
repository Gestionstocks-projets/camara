-- Photo de l'appareil (Stock) — champ optionnel + bucket Storage dédié.

alter table phones add column photo_url text;

insert into storage.buckets (id, name, public)
values ('phone-photos', 'phone-photos', true)
on conflict (id) do nothing;

create policy "phone_photos_insert_authenticated" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'phone-photos');

create policy "phone_photos_read_public" on storage.objects
  for select using (bucket_id = 'phone-photos');
