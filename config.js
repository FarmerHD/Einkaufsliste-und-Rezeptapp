// Supabase-Zugangsdaten für "Meine Rezepte".
// project-id: pzkmjqaxyaxsfjyqfzyb
// Der "publishable" Schlüssel ist bewusst öffentlich im Code -- das ist bei Supabase so vorgesehen.
// Der eigentliche Schutz kommt aus Row Level Security (RLS) + Login, nicht aus der Geheimhaltung
// dieses Schlüssels. Siehe arbeitsplan.md, Abschnitt 6, für das RLS-Setup.
window.supabaseClient = supabase.createClient(
  "https://pzkmjqaxyaxsfjyqfzyb.supabase.co",
  "sb_publishable_a1pWjnZrcl1aeH-sYQxigA_E5_asZOv"
);