# Spécification de Sécurité Firestore - JEAN AUTO VSP

## Phase 0 : Invariants de Données et Modèle Menaces

### 1. Invariants de Données (Data Invariants)
1. **Unicité et intégrité de l'identifiant (ID Poisoning Guard)** : Tout document créé ou modifié doit avoir un identifiant alphanumérique sûr (`^[a-zA-Z0-9_-]+$`, 1 à 128 caractères) correspondant exactement à la clé `id` du document.
2. **Contrôle d'accès administrateur vérifié (Email Spoofing Guard)** : Aucun utilisateur non vérifié (`email_verified != true`) ou non autorisé (`email != 'mozartmozartoi3@gmail.com'` et absent de `/admins/{uid}`) ne peut modifier le parc véhicules (`vsp_vehicles`), les marques (`vsp_brands`), les paramètres bancaires/commerciaux (`vsp_commercial_settings`), le SEO (`vsp_seo`), la FAQ (`vsp_faqs`), les fiches clients (`vsp_customers`), le journal d'activité (`vsp_activity_logs`) ou les utilisateurs (`wp_users`).
3. **Isolation stricte des données personnelles (PII Isolation)** : Les collections `vsp_orders` (incluant adresse, téléphone, email et détails CB), `vsp_customers`, `wp_users` et `vsp_activity_logs` sont strictement illisibles (`get` et `list` interdits) pour tout visiteur anonyme ou utilisateur non administrateur.
4. **Intégrité référentielle des commandes (Global Consistency Invariant)** : Aucune commande client (`vsp_orders`) ne peut être créée sans référence valide à un véhicule existant dans `/vsp_vehicles/{vehicleId}` via `exists(...)`.
5. **Intégrité temporelle et immutabilité (Temporal Integrity & Immortal Fields)** : Les horodatages `createdAt` et `updatedAt` doivent correspondre à `request.time` à la création, et `createdAt` reste strictement immuable après création (`incoming().createdAt == existing().createdAt`).
6. **Contrôle strict des clés (Anti-Update-Gap & Shadow Fields Guard)** : Chaque entité vérifie `keys().hasAll(...) && keys().hasOnly(...)` via un helper `isValid[Entity]()` appelé sur `create` et `update`, ainsi que `diff(existing()).affectedKeys().hasOnly(...)` pour chaque action `update`.
7. **Verrouillage des états terminaux (Terminal State Locking)** : Une commande marquée `vendu`, `annulee` ou `refusee` ne peut plus être modifiée par des comptes non administrateurs (seul `isAdmin()` dispose d'une dérogation explicite).
8. **Visibilité catalogue sans fuite de brouillons (Secure List Queries)** : Les requêtes publiques sur `vsp_vehicles`, `wp_posts`, `wp_pages` et `wp_comments` sont contraintes côté règles (`resource.data.status == 'publish'` / `'approved'`) afin d'empêcher la lecture de brouillons ou d'éléments placés à la corbeille.

---

### 2. Les 12 Payloads Hostiles (« Dirty Dozen »)
Tous ces payloads doivent systématiquement échouer (`PERMISSION_DENIED`) :

1. **Shadow Field Injection sur `vsp_vehicles`** : Création d'un véhicule contenant un champ fantôme non autorisé (`isAdminApproved: true` ou `discountOverride: 9999`).
2. **Email Spoofing sans vérification** : Requête d'écriture admin avec `request.auth.token.email == 'mozartmozartoi3@gmail.com'` mais `email_verified: false`.
3. **PII Blanket Read sur `vsp_orders`** : Lecture (`get` ou `list`) de `vsp_orders` par un visiteur anonyme ou un utilisateur connecté non administrateur.
4. **PII Blanket Read sur `vsp_customers`** : Lecture (`get` ou `list`) de `vsp_customers` par un utilisateur non administrateur.
5. **ID Poisoning** : Création d'un véhicule ou d'une commande avec un ID contenant des caractères d'injection/saut de chemin (`../../admins/hacker`) ou > 128 caractères.
6. **Client Timestamp Tampering** : Création ou mise à jour d'un véhicule en forgeant un `createdAt` antidaté côté client au lieu de `request.time`.
7. **Immortal Field Mutation** : Mise à jour d'un véhicule tentant de modifier `id` ou `createdAt`.
8. **Orphaned Order Attack** : Soumission d'une commande publique pointant vers un `vehicleId` inexistant (`veh-inexistant-999`).
9. **State Shortcutting sur commande publique** : Création d'une commande publique avec le statut directement forcé à `vendu` ou `documents_transmis` au lieu d'un statut initial autorisé (`nouvelle`, `paiement_a_verifier`, `paiement_confirme`).
10. **Value / Resource Exhaustion ("Denial of Wallet")** : Injection d'une chaîne de 1 Mo dans `brand`, `description` ou un tableau `gallery` dépassant 30 éléments.
11. **Array Type Poisoning** : Injection d'un tableau `gallery` contenant des nombres (`[12345]`) au lieu de chaînes URL valides.
12. **Self-Assigned Privilege Escalation sur `/admins/{uid}`** : Tentative par un utilisateur standard de créer son propre document `/admins/{uid}` pour s'octroyer les droits administrateur.
