# Schéma NoSQL pour le Gestionnaire de Stock de Produits

## Collections

Dans le cadre d'un modèle simplifié de gestion de stock de produits multi-magasins, nous aurons `Store` (Magasin), `Product` (Produit), `Stock` (Stock), `Orders` (Commandes) et `Reservations` (Réservations).

En suivant la commodité de Firestore et les principes NoSQL, nous définirons ces modèles de base comme des collections. Chaque collection de modèles contiendra des documents pour ses entrées.

Pour les réservations, nous simplifierons le processus en ajoutant simplement une quantité réservée `reservedQuantity`. Cette valeur nous indiquera la quantité réservée à partir de `quantity`. Et `quantity` représente la quantité physique dans le magasin.

> Dans une architecture plus détaillée, une réservation serait son propre document avec plus de détails, incluant l'ID du client qui lie l'ID du client concerné. Cela fournirait plus de clarté et de traçabilité.

## Produit vs Stock

Dans le contexte de la gestion de stock, nous isolons le catalogue des produits du stock et de l'inventaire.

Le modèle `Product` est un document contenant tous les produits disponibles, leurs détails et leur prix de base.

Le modèle `Stock` lie un produit à un magasin. D'un point de vue métier, il représente physiquement le produit sur l'étagère ou dans l'inventaire du magasin.

La clé du stock (`key`) est le code-barres ou la référence du produit. Cela simplifie la recherche, car l'index de cet élément de stock est le code-barres du produit, ce qui permet de le scanner directement et de le trouver facilement.

## Périmés

Le concept des dates de péremption est lié à la représentation physique des produits en magasin. Par conséquent, il sera un attribut du stock plutôt que du produit.

Dans le modèle présenté, les péremptions sont une liste (Array) contenant la date de péremption en timestamp et la quantité de produits en magasin avec cette date de péremption.

```json
"expirations": [
    {
        "date": "timestamp",
        "quantity": "number"
    }
],
"soonestExpirationDate": "timestamp"
```

`soonestExpirationDate` est un champ calculé, qui prend la date la plus proche et la stocke lors de la création ou des mises à jour. L'objectif de cet attribut est de mieux filtrer les produits proches de la péremption.

Dans l'API, nous aurons un endpoint pour vérifier les péremptions. Cet endpoint vérifiera `soonestExpirationDate` et récupérera la quantité de produits ayant la date de péremption la plus proche, avec une tolérance en jours, afin d'alerter le magasin pour qu'il les traite.

En cas de réapprovisionnement du magasin, les produits déjà existants seront simplement mis à jour. Si les produits ajoutés ont une date de péremption différente, l'attribut expirations sera également mis à jour et `soonestExpirationDate` sera recalculé.

## Commandes

Les commandes dans ce modèle de données sont simplifiées. J'ai travaillé sur un projet complet de gestion de stock, mais la structure de données que je fournis ici est très basique. Dans une application réelle de gestion de stock, il y aurait plus de détails, de relations et de traçabilité.

Le modèle Order contient l'ID du magasin lié à l'achat (`storeId`), la date d'achat (`purchaseDate`), le prix total (total taxé), ainsi que le statut de la commande qui peut être `PROCESSING | CANCELED | CONFIRMED | REFUNDED`.

Les articles des commandes sont des références aux produits du stock, avec la quantité sélectionnée et le prix d'achat de ces produits. Le prix ici correspond au prix au moment de l'achat. Si le prix d'un produit change, les prix des commandes ne seront pas affectés, ce qui rend les rapports réalistes.

Nous avons également un champ `expirationDate`. Ce champ nous aide dans le processus de remboursement, où nous pouvons savoir quelle date de péremption incrémenter. Si cette date n'existe pas, nous créons un nouvel élément dans l'array expirations.

## Identifiants

Seuls deux modèles nécessitent des identifiants personnalisés : `product` et `stock`. L'ID de ces deux modèles est le code-barres du produit physique référencé. Les autres modèles peuvent avoir des ID générés automatiquement.
