# Caverns & Kubernetes

## A Roguelike microservices ecosystem

This is the prototype for a distributed multiplayer dungeon crawl game, with a dual purpose:

- Illustrate architecture and design patterns for building microservice-based solutions hosted in kubernetes
- Be a fun and challenging game!

## Running

The main server is started with `npm start` and this will fire up a server that you can then point a browser to and start playing.

However, all monsters in the game are run as separate microservices. You need to set the `ENV` variable `export ROLE="MONSTERS"` before running `npm start` in another shell.

## Coding

The architecture aims to enable easy extensibility of the game with new features.

```bash
src/
├── client/
├── common/
├── config/
│   └── maps/
├── frontend/
│   ├── images/
│   ├── javascripts/
│   │   └── screens/
│   └── stylesheets/
├── monsters/
├── routes/
├── server/
│   ├── entities/
│   ├── generators/
│   └── items/
├── start-monsters.js
├── start-server.js
└── start.sh
```
