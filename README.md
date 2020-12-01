# PWA-TP3 Yacine O.

## Installation et lancement

git clone https://github.com/enicayzer/PWA-TP3
- npm install
- npm start

## Informations

Packages utilisés : 
- ngx-qrcode2 (génération d'un QR Code');
- qrcode-parser (lecture d'un QR Code depuis une image');
- bootstrap (popup d'authentification);
- firebase.

# Fonctionnalités développées
- Effacer tout;
- Undo / Redo (Annuler / Refaire);
- Sérialisation / désérialisation des données localement;
- Utilisation de reconnaissance vocale (problème lors du rafraichissement de la liste à la fin de l'enregistrement. Utilisation de ChangeDetectorRef pour résoudre le problème. Il faut cliquer sur l'icône "micro" pour lancer l'enregistrement, l'icône change de couleur pour devenir bleue.
Une autorisation d'écoute du micro sera demandée par le navigateur. Si aucun son n'est enregistré au bout de quelques secondes le micro n'écoutera plus et l'icône redeviendra noire. Il faudra de nouveau cliquer sur le bouton pour réenregistrer un nouvel item dans la liste.
La langue d'écoute est le français);
- Copie de listes par QR Code et génération d'un QR Code (certains packages sont trop anciens et ne s'installaient pas. Zone de drag & drop ou clic pour sélectionner une image QR Code et de la déposer pour alimenter la liste);
- Création, identification des utilisateurs et synchronisation des données avec FireBase (pas de problème lors de la mise en place de firebase. 
L'authentification va supprimer les éléments de la liste pour ajouter les données de firebase.
Au début, j'avais effectué un ajout des items mais lors d'une déconnexion puis reconnexion on ajoute de nouveau les mêmes valeurs.).

