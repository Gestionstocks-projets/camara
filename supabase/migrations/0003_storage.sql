-- Buckets Storage — factures PDF (partage WhatsApp, prompt 09) et logo/
-- pièces jointes boutique (Paramètres, prompt 12). Voir 00-CONTEXTE.md.

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('shop-assets', 'shop-assets', true)
on conflict (id) do nothing;

create policy "invoices_insert_authenticated" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'invoices');

create policy "invoices_read_public" on storage.objects
  for select using (bucket_id = 'invoices');

create policy "shop_assets_write_owner" on storage.objects
  for all to authenticated
  using (bucket_id = 'shop-assets' and is_owner())
  with check (bucket_id = 'shop-assets' and is_owner());

create policy "shop_assets_read_public" on storage.objects
  for select using (bucket_id = 'shop-assets');
