/* Configuration des comptes et du classement (Supabase).
   Tant que ces deux valeurs sont vides, le site marche sans compte : la progression reste sur l'appareil.
   Pour les remplir : Supabase → ton projet → Project Settings → API.
   - supabaseUrl : « Project URL »
   - supabaseKey : la clé « anon public » (elle est faite pour être publique : la sécurité vient des règles RLS de supabase/schema.sql). */
window.ATELIER_CONFIG = {
  supabaseUrl: '',
  supabaseKey: ''
};
