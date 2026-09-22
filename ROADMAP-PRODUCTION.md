# Vinted Manager — Roadmap production

## Objectif
Transformer le prototype actuel en SaaS commercial multi-utilisateur avec comptes, synchronisation cloud, Free/Pro/Lifetime, Stripe et déploiement web.

## Ordre d'implémentation
1. Importer la version complète actuelle de l'application.
2. Stabiliser l'architecture et les dépendances.
3. Finaliser Supabase Auth.
4. Migrer les données métier de localStorage vers Supabase.
5. Activer et tester RLS pour isoler les utilisateurs.
6. Ajouter les profils et préférences utilisateur.
7. Ajouter les plans Free / Pro / Lifetime côté serveur.
8. Créer les produits/prix Stripe.
9. Implémenter Checkout Stripe.
10. Implémenter les webhooks Stripe côté serveur.
11. Synchroniser l'état d'abonnement dans Supabase.
12. Protéger les fonctionnalités Pro côté serveur et client.
13. Déployer l'application.
14. Ajouter domaine personnalisé.
15. Mettre en place emails, monitoring et sauvegardes.
16. Beta privée puis lancement public.

## Architecture cible

GitHub → hébergement web → application
                         ├→ Supabase Auth + PostgreSQL + RLS
                         └→ Stripe Checkout + Webhooks

## Sécurité
- Aucun secret Stripe ou Supabase service_role dans le frontend.
- Les droits d'accès aux données sont contrôlés par RLS.
- Le statut d'abonnement de référence vient du backend/webhook Stripe.
- Les clés publiques uniquement peuvent être présentes dans le frontend.

## Plans provisoires
- Free : 0 €/mois
- Pro : 4,99 €/mois
- Lifetime : 49,99 € une fois

Ces prix sont provisoires et doivent être confirmés avant la configuration Stripe.
