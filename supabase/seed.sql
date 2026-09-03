-- Données de démonstration pour le développement local uniquement.
-- Ne jamais exécuter sur le projet Supabase de production.

-- Compte propriétaire de test : proprietaire@test.local / motdepasse123
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'proprietaire@test.local',
  crypt('motdepasse123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
);

insert into profiles (id, full_name, role) values
  ('11111111-1111-1111-1111-111111111111', 'Propriétaire Test', 'owner');

-- Fournisseurs
insert into suppliers (id, name, phone, whatsapp, city) values
  ('22222222-2222-2222-2222-222222222221', 'Dakar Mobile Import', '771234567', '771234567', 'Dakar'),
  ('22222222-2222-2222-2222-222222222222', 'Touba Téléphones Gros', '772345678', '772345678', 'Touba');

-- Clients
insert into clients (id, first_name, last_name, phone, whatsapp, city) values
  ('33333333-3333-3333-3333-333333333331', 'Mamadou', 'Diallo', '770001122', '770001122', 'Dakar'),
  ('33333333-3333-3333-3333-333333333332', 'Fatou', 'Sow', '770003344', '770003344', 'Thiès');

-- Téléphones en stock
insert into phones (
  id, brand, model, imei, condition, ram, storage, color, status,
  supplier_id, arrival_date, purchase_price, extra_fees, planned_sale_price
) values
  ('44444444-4444-4444-4444-444444444441', 'Apple', 'iPhone 13', '356938035643801', 'neuf', '4 Go', '128 Go', 'Noir', 'en_stock',
   '22222222-2222-2222-2222-222222222221', current_date - 5, 300000, 5000, 350000),
  ('44444444-4444-4444-4444-444444444442', 'Samsung', 'Galaxy A54', '356938035643802', 'quasi_neuf', '8 Go', '256 Go', 'Bleu', 'en_stock',
   '22222222-2222-2222-2222-222222222222', current_date - 2, 150000, 2000, 210000);
