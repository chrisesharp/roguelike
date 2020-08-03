"use strict";
import 'regenerator-runtime/runtime.js'
import axios from 'axios';
import ServerHealth from './server-health';
import ExplorerMap from './explorer-map';
import RogueClient from '../../client/rogue-client';
import { EVENTS } from '../../common/events';

import { Display, dispOpts } from './display';
import { loginScreen } from './screens/login';
import { playScreen } from './screens/play.js'

const stats = document.getElementById('stats_pane');
const hostname = location.host;
const BASE_URL = 'http://'+hostname;
const DEFAULT_ROLES = [
    {type:"warrior",name:"Warrior"}
];

class Game {
    constructor() {
        this.currentScreen = null;
        this.screenWidth =  dispOpts.width,
        this.screenHeight = dispOpts.height - 1,
        this.display = new Display(dispOpts);
        this.title = " NodeJS Roguelike ";
        this.client = new RogueClient(BASE_URL,(event, data) => {this.refresh(event, data);});
        this.messages = [];

        let bindEventToScreen = (event) => {
            window.addEventListener(event, function(e) {
                if (game.currentScreen !== null) {
                    game.currentScreen.handleInput(event, e);
                }
            });
        };
        bindEventToScreen('keydown');
        bindEventToScreen('keypress');
    }

    start(nameField, messageField, statsField) {
        this.nameField = nameField;
        this.messageField = messageField;
        this.statsField = statsField;
        this.switchScreen(loginScreen);
    }

    initRoles(roleField, rolePrototype) {
        this.roleField = roleField;
        this.rolePrototype = rolePrototype;
        axios.get(`${BASE_URL}/roles`,{
                timeout: 2500
            }).then( (result) => {
                game.updateRolesOptions(result.data);
            }).catch( () => {
                game.updateRolesOptions(DEFAULT_ROLES);
            });
    }

    updateRolesOptions(roles) {
        this.roleField.removeChild(this.rolePrototype);
        roles.forEach((role) => {
            let newRole = this.rolePrototype.cloneNode(false);
            newRole.value = role.type;
            newRole.innerHTML = role.name;
            this.roleField.appendChild(newRole);
        });
    }

    mapAvailable(map) {
        this.map = new ExplorerMap(map);
        this.map.setupFov();
        this.entrance = this.map.entrance;
        this.switchScreen(playScreen);
    }

    getMap() {
        return this.map;
    }

    getEntrance() {
        return this.entrance;
    }

    move(direction) {
        this.client.move(direction);
    }

    takeItem(item) {
        this.client.takeItem(item);
    }

    dropItem(item) {
        this.client.dropItem(item);
    }

    eat(item) {
        this.client.eat(item);
    }

    wieldItem(item) {
        this.client.wieldItem(item);
    }

    wearItem(item) {
        this.client.wearItem(item);
    }

    getEntityAt(x, y, z) {
        return this.client.getEntityAt(x, y, z);
    }

    getItemsAt(x, y, z) {
        return this.client.getItemsAt(x, y, z);
    }

    addMessage(message) {
        this.messages.push(message);
        this.refresh();
    }

    getMessages() {
        return this.messages;
    }

    clearMessages() {
        this.messages = [];
    }

    connectToServer(properties) {
        if (!properties) {
            properties = this.updateName();
            properties.type = "player";
        }
        this.client.connectToServer(properties);
    }

    getDisplay() {
        return this.display;
    }

    getScreenWidth() {
        return this.screenWidth;
    }
    
	getScreenHeight() {
	    return this.screenHeight;
    }

    refresh(event, data) {
        if (event === EVENTS.reset) {
            console.log("Reset called in game");
        }
        if (event === EVENTS.dead) {
            this.currentScreen.gameOver();
        }
        
        if (event === EVENTS.message) {
            this.addMessage(data);
        }

        if (event === EVENTS.map) {
            this.mapAvailable(data);
        }

        this.display.clear();
        if (this.currentScreen) {
            this.currentScreen.render(this.display);
        }
    }

    switchScreen(screen) {
        if (this.currentScreen) {
            this.currentScreen.exit();
        }
        this.currentScreen = screen;
        if (this.currentScreen) {
            this.currentScreen.enter();
            this.refresh();
        }
    }

    updateStats(stats) {
        game.statsField.innerHTML = stats;
    }

    setNameField(nameInput, roleInput) {
        let name = nameInput.value;
        let role = roleInput.value;
        this.nameField.innerHTML = `${name} (${role})`;
        return {name:name, role:role};
    }

    getNameField() {
        return this.nameField.querySelector("#name_input");
    }

    getRoleField() {
        return this.nameField.querySelector("#role_input");
    }

    hideInputFields(...fields) {
        fields.forEach(field => {
            field.style.display = "none";
        });
    }

    updateName() {
        let nameInput = this.getNameField();
        let roleInput = this.getRoleField();
        this.hideInputFields(nameInput, roleInput);
        return this.setNameField(nameInput, roleInput);
    }

    updateMessages(text) {
        let newMessage = messagePrototype.cloneNode(false);
        newMessage.innerHTML = text;
        this.messageField.appendChild(newMessage);
        this.messageField.scrollTop = this.messageField.scrollHeight;
    }

    getScreen() {
        return this.currentScreen;
    }

    getEntity() {
        return this.client.getEntity();
    }
}

export const game = new Game();
const monitor = new ServerHealth(`${BASE_URL}/health`);
const playfield = document.getElementById('playfield');
const roleField = document.getElementById('role_input');
const rolePrototype = document.getElementsByClassName('role')[0];
const name = document.getElementById('name');
const messages = document.getElementById('messages');
const messagePrototype = document.getElementsByClassName('message')[0];
const status = document.getElementById('status');

window.onload =  async () => {
    playfield.appendChild(game.getDisplay().getContainer());
    monitor.initServerHealth(status);
    game.initRoles(roleField, rolePrototype);
    name.querySelector("#name_input").focus();
    game.start(name, messages, stats);
};