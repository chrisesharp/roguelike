"use strict";

const Screens = {};

import {startScreen}  from "./start.js"; 
Screens.startScreen = startScreen;

import {helpScreen}  from "./help.js"; 
Screens.helpScreen = helpScreen;

import {playScreen}  from "./play.js"; 
Screens.playScreen = playScreen;

// import {lookScreen}  from "./targets.js"; 
// Screens.lookScreen = lookScreen;

// import {wieldScreen}  from "./items.js"; 
// Screens.wieldScreen = wieldScreen;

// import {wearScreen}  from "./items.js"; 
// Screens.wearScreen = wearScreen;

// import {eatScreen}  from "./items.js"; 
// Screens.eatScreen = eatScreen;

// import {examineScreen}  from "./items.js"; 
// Screens.examineScreen = examineScreen;

import {dropScreen}  from "./item-list.js"; 
Screens.dropScreen = dropScreen;

// import {pickupScreen}  from "./items.js"; 
// Screens.pickupScreen = pickupScreen;

import {inventoryScreen}  from "./item-list.js"; 
Screens.inventoryScreen = inventoryScreen;

export { Screens }; 