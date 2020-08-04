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
├── client/           # client used in web frontend and bots
├── common/           # common abstractions used in front and backend
├── frontend/         # Web frontend for players
├── monsters/         # Bot code for each type of monster
├── routes/           # REST API code
├── server/           # Code for the backend server
│   ├── config/       # home for configuration of server
│   │   └── maps/     # home for map configuration files
│   ├── entities/     # Code for each type of player or monster entity
│   ├── generators/   # Code for different types of cave generation
│   └── items/        # Code for each type of item - weapons, armour, food, etc.
└── start.sh          # Entry point for microservice
```
