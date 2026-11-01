/* Configuration des comptes et du classement (Supabase).
   Tant que ces deux valeurs sont vides, le site marche sans compte : la progression reste sur l'appareil.
   Pour les remplir : Supabase → ton projet → Project Settings → API.
   - supabaseUrl : « Project URL »
   - supabaseKey : la clé « anon public » (elle est faite pour être publique : la sécurité vient des règles RLS de supabase/schema.sql). */
window.ATELIER_CONFIG = {
  supabaseUrl: 'https://zsbdvtjdhjqxibfjvgey.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzYmR2dGpkaGpxeGliZmp2Z2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NTgzNjgsImV4cCI6MjEwOTEzNDM2OH0.hmspZ6TIacn-MQDccqx5BS9DkcJRL0LNYIb-E_uqW2c'
};
