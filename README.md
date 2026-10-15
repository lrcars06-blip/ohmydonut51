# Oh My Donut Reims

Site vitrine et commande en click & collect pour Oh My Donut, 19 rue des Capucins, 51100 Reims.

Aucune installation, aucun build. Tous les fichiers sont à la racine, sauf le dossier `api/` qui contient les deux fonctions serveur du paiement SumUp.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Le site complet : animation d'accueil, carte, composition de box, panier, créneaux de retrait |
| `mentions-legales.html` | Mentions légales et RGPD |
| `404.html` | Page d'erreur |
| `donut-*.webp` | Les 29 photos produits (600×600, recadrage identique) |
| `cut-*.webp` | Les mêmes donuts détourés (fond transparent) pour l'animation, la box et le panier |
| `logo-ohmydonut.webp`, `logo-emblem.webp` | Logo officiel détouré (version longue et emblème) |
| `hero-boutique.mp4`, `hero-boutique-mobile.mp4`, `hero-boutique-poster.jpg` | Vidéo de fond de l'accueil (ordinateur, mobile, image d'attente) |
| `favicon-64.png`, `apple-touch-icon.png`, `icon-512.png` | Icônes du site |
| `manifest.webmanifest` | Ajout à l'écran d'accueil sur mobile |
| `robots.txt`, `sitemap.xml` | Référencement Google |
| `vercel.json` | URLs propres et en-têtes de sécurité sur Vercel |
| `api/sumup-checkout.js`, `api/sumup-status.js` | Les deux fonctions serveur du paiement SumUp (Vercel les détecte automatiquement) |

## Mise en ligne

**Vercel (recommandé)**
1. Pousser ce dossier sur un dépôt GitHub.
2. Sur vercel.com : Add New, Project, importer le dépôt, Framework Preset « Other », Deploy.

**GitHub Pages**
Settings, Pages, Source « Deploy from a branch », branche `main`, dossier `/ (root)`.

## À personnaliser avant la mise en ligne

Tout se règle en haut du `<script>` de `index.html` :

- `SHOP` : téléphone, e-mail et WhatsApp qui reçoivent les commandes, horaires par jour (`hours`, 0 = dimanche), délai de préparation.
- `SHOP.orderEndpoint` : optionnel, URL d'un webhook (Make, n8n, API) qui reçoit aussi la commande en JSON.
- Offre limitée dans le temps : ajouter `until: 11*60` à un produit limite les créneaux de retrait du panier à 11h.
- `SHOP.maxDaysAhead` : commande possible jusqu'à 30 jours à l'avance. `SHOP.eventMinDays` : délai minimum pour un événement (48h).
- `SHOP.sumup` : `enabled` (false tant que les clés ne sont pas sur Vercel), `depositRate` (acompte, 30 %), `minDeposit` (5 €).
- `PRODUCTS` : noms, descriptions, prix (indicatifs) et photo (`img`). `best:true` place un donut dans l'onglet Best-sellers, `tier` le range en Classiques, Gourmands ou Premium.
- `BOX_SIZES` : prix des box de 4, 6 et 12.
- Animation d'accueil : jouée à chaque chargement, durée réglée par `setTimeout(done, 2700)` dans `runIntro()`. Pour la retirer, supprimer le bloc `<div class="intro">` et l'appel `runIntro();`.

Autres points :

- Remplacer `ohmydonut-reims.vercel.app` par le vrai domaine dans `index.html`, `robots.txt` et `sitemap.xml`.
- Compléter les champs surlignés dans `mentions-legales.html`.

## Réception automatique des commandes (à faire une fois après la mise en ligne)

**E-mail (FormSubmit, gratuit)**
1. Sur le site en ligne, passer une commande test.
2. FormSubmit envoie un e-mail « Activate Form » à ohmydonutreims@gmail.com : cliquer sur le bouton d'activation.
3. Repasser une commande test : elle arrive par e-mail sous forme de tableau. Penser à vérifier les spams la première fois.

**WhatsApp sur le 06 47 69 82 09 (CallMeBot, gratuit)**
1. Depuis ce téléphone, suivre la procédure sur callmebot.com (section WhatsApp) : ajouter leur numéro aux contacts et leur envoyer le message d'autorisation indiqué.
2. CallMeBot répond avec une clé (`apikey`).
3. Coller cette clé dans `SHOP.whatsappKey` en haut du script de `index.html`, puis republier.

**SMS classique**
Un vrai SMS automatique demande un service payant (Brevo, Twilio, OVH : environ 5 à 8 centimes par SMS) et une petite fonction serveur pour cacher la clé. Ce n'est pas possible dans un dossier 100 % statique.

**Secours** : si aucun envoi automatique ne passe, l'écran de confirmation propose au client d'envoyer sa commande par SMS pré-rempli.

## Paiement en ligne SumUp (acompte ou totalité)

Le site utilise la page de paiement hébergée de SumUp : le client est redirigé vers SumUp, paie, et revient sur le site. La clé API reste côté serveur, dans les deux fonctions du dossier `api/`.

1. Sur sumup.com, se connecter au compte de la boutique, puis créer une clé API dans l'espace développeur (Developer, API keys).
2. Noter le code marchand (Merchant code, format `MCXXXXXX`), visible dans le profil du compte.
3. Sur Vercel : Settings, Environment Variables, ajouter `SUMUP_API_KEY` et `SUMUP_MERCHANT_CODE`, puis redéployer.
4. Dans `index.html`, passer `SHOP.sumup.enabled` à `true` et republier.
5. Test : passer une commande avec « Acompte en ligne », payer, vérifier que l'écran de retour affiche « Paiement reçu » et que la boutique reçoit l'e-mail « ✅ Paiement reçu ».

Tant que `enabled` vaut `false`, les deux options de paiement en ligne sont affichées grisées avec la mention « bientôt », et seul le paiement au retrait est possible. Si SumUp ne répond pas au moment de la commande, celle-ci est quand même enregistrée en paiement au retrait. Frais SumUp sur paiement en ligne : à vérifier sur le compte (de l'ordre de 2,5 % par transaction).

Le code marchand et la clé API ne doivent jamais être écrits dans `index.html`.

## Format d'une commande envoyée à `orderEndpoint`

```json
{
  "code": "OMD-X47O",
  "name": "Prénom",
  "phone": "06 12 34 56 78",
  "note": "",
  "mode": "collect",
  "date": "2026-10-16",
  "time": "19h00",
  "pickup": "aujourd'hui à 19h00",
  "pay": "deposit",
  "deposit": 7.5,
  "payStatus": "payé",
  "event": { "type": "Anniversaire", "who": "Léa", "age": "7", "guests": "12", "msg": "" },
  "total": 24.9,
  "lines": [{ "name": "Box de 6 donuts", "opts": "2 Rainbow, ...", "qty": 1, "price": 15.9 }],
  "createdAt": "2026-10-14T09:30:00.000Z"
}
```
