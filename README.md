# Algorithme Heuristique 1|ri|C̄

Ce projet implémente en Python une heuristique pour minimiser le **temps moyen de complétion C̄** dans un problème d'**ordonnancement sur une machine unique**, où chaque tâche a :
- un **temps de disponibilité** `ri`
- un **temps de traitement** `pi`

## 📘 Description du problème
On veut ordonner `n` tâches de manière à réduire le temps moyen de complétion défini par :

\[
\bar{C} = \frac{1}{n} \sum_{i=1}^{n} C_i
\]

où `C_i` est le temps de complétion de la tâche `Ti`.

## ⚙️ Fonctionnement de l’algorithme

L’algorithme suit une stratégie **gloutonne** :
1. On initialise le temps `t` comme le plus petit temps de disponibilité.
2. À chaque étape, parmi les tâches disponibles (`ri ≤ t`), on choisit celle avec le **plus petit temps de traitement**.
3. Si aucune tâche n’est disponible, on avance le temps.
4. On calcule à la fin le **temps moyen de complétion**.

### Exemple d'entrée

```python
# Temps de disponibilité
r = [0, 1, 2]
# Temps de traitement
p = [3, 2, 1]

sortie:
Ordre d’exécution : T1 → T3 → T2
C̄ = 4.33

## 📊 Analyse de complexité

| Étape | Complexité |
|-------|------------|
| Sélection d’une tâche| O(n) | 
| Boucle principale | O(n²) |
| Complexité totale | O(n²) |
