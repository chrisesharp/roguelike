"use strict";

const Players = {};
const Monsters = {};

import Warrior from './warrior.js';
Players.Warrior = Warrior;

import Wizard from './wizard.js';
Players.Wizard = Wizard;

import Goblin from './goblin.js';
Monsters.Goblin = Goblin;

import Orc from './orc.js';
Monsters.Orc = Orc;

export { Players, Monsters };