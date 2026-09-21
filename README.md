# Vinted Manager

Vinted Manager — application de gestion d’activité Vinted.

## État du projet

**Étape 1 :** prototype séparé en fichiers, données initiales vides et stockage local.

**Étape 2 :** fondations Supabase ajoutées :
- écran inscription / connexion ;
- reset du mot de passe ;
- déconnexion ;
- config.js pour l’URL Supabase et la clé anon ;
- supabase/schema.sql avec profils, stock, ventes, dépenses, abonnements et RLS ;
- structure Free / Pro / Lifetime.

## Fichiers

- index.html
- config.js
- auth.js
- supabase/schema.sql
- STEP-2.md
- app-parts/ : migration progressive du code applicatif.

## Configuration Supabase

1. Créer un projet Supabase.
2. Renseigner l’URL et la clé anon dans config.js.
3. Exécuter supabase/schema.sql.
4. Configurer la confirmation e-mail.

**Ne jamais publier la clé service_role.**

## Suite

Migration du stockage métier de localStorage vers Supabase, puis gestion Free/Pro/Lifetime et paiements Stripe avec validation serveur/webhook.
