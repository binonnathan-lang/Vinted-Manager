# Étape 2 — Authentification + base Supabase

La Vinted Manager V2 prépare :
- inscription / connexion / reset password avec Supabase Auth ;
- profils utilisateurs ;
- tables stock, ventes, dépenses et abonnements ;
- RLS pour isoler les données par utilisateur ;
- structure Free / Pro / Lifetime.

## Configuration
1. Créer un projet Supabase.
2. Mettre l'URL et la clé **anon** dans `config.js`.
3. Exécuter `supabase/schema.sql` dans le SQL Editor.
4. Configurer la confirmation e-mail dans Supabase Auth.

La clé `service_role` ne doit jamais être placée dans le navigateur ou dans GitHub.

## Important
La migration des données métier de `localStorage` vers Supabase est l'étape suivante : l'authentification est préparée, mais la V1 conserve encore son stockage local tant que cette migration n'est pas faite.
