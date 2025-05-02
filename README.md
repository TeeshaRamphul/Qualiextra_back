# Qualiextra_back


# Installation

## 1. Cloner le repository

Clonez le projet à l'aide de Git et naviguez dans le répertoire du projet :

```
git clone git@github.com:TeeshaRamphul/Qualiextra_back.git
cd qualiextra_back
```

## 2. Installer les dépendances

Installez toutes les dépendances nécessaires à l'application en utilisant npm :

```
npm install
```

## 3. Configurer les Variables d'Environnement

À la racine de votre projet, créez un fichier .env :

```
touch .env
```
Copiez ensuite le contenu du fichier .env.example dans le fichier .env .


Le fichier .env contiendra plusieurs variables que vous devrez configurer. Voici un exemple de contenu :

```
PORT=3000
BASE_URL='http://localhost:3000'
DB_URL=postgres://qualiextra:mdp@localhost:5432/nomDeBase

ACCESS_TOKEN_SECRET= 
ACCESS_TOKEN_EXPIRES_IN=4h

MAILTRAP_USER="#"
MAILTRAP_PASS="#"
```

- PORT : Définit le port sur lequel l'application sera disponible. Par défaut, c'est 3000.

- BASE_URL : L'URL de base de votre application. Si en local, utilisez http://localhost:3000. 

- DB_URL : L'URL de connexion à la base de données. Remplacez qualiextra, mdp, localhost, 5432 et nomDeBase par les informations spécifiques à votre base de données PostgreSQL.

- ACCESS_TOKEN_SECRET : Une clé secrète utilisée pour signer et valider les tokens JWT. Choisissez une valeur secrète et unique.

- ACCESS_TOKEN_EXPIRES_IN : La durée d'expiration du JWT. Par défaut, c'est 4h (4 heures).

- MAILTRAP_USER et MAILTRAP_PASS : Les identifiants pour utiliser Mailtrap. Si vous utilisez un autre service SMTP, remplacez-les par les informations nécessaires.

## 4. Initialiser et peupler la base de données

Avant de démarrer l'application, vous devez créer et initialiser la base de données. Pour ce faire, utilisez la commande suivante pour créer les tables dans votre base de données :

```
npm run db:create
```
Cette commande exécutera un script pour créer les tables nécessaires dans votre base de données.

## 5. Lancer l'application

Une fois tout configuré, vous pouvez démarrer l'application en mode développement avec la commande suivante :

```
npm run dev
```
Cela démarrera le serveur sur le port défini dans le fichier .env.

## 6. Vérification du bon fonctionnement

Une fois l'application lancée, vous pouvez vérifier qu'elle fonctionne correctement en accédant à Swagger à l'adresse suivante :

```
http://localhost:3000/api-docs
```
Swagger vous permettra de voir les API disponibles et de tester les différentes routes de l'application.