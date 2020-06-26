"use strict";
import 'regenerator-runtime/runtime.js'
import axios from 'axios';
import ServerHealth from './server-health';
import Map from './map';
import Entity from './entity';
import Item from './item';

import { Display, dispOpts } from './display';
import { startScreen } from './screens/start';
import { playScreen } from './screens/play.js'
import io from 'socket.io-client';

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
        this.player = new Entity();
        this.npcs = {};
        this.entities = {};
        this.items = {};
        this.messages = [];
        this.addEntity(this.player);

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
        this.switchScreen(startScreen);
    }

    initRoles(roleField, rolePrototype) {
        this.roleField = roleField;
        this.rolePrototype = rolePrototype;
        axios.get(`${BASE_URL}/roles`,{
                timeout: 2500
            }).then( (result) => {
                game.updateRoles(result.data);
            }).catch( (error) => {
                game.updateRoles(DEFAULT_ROLES);
            });
    }

    updateRoles(roles) {
        this.roleField.removeChild(this.rolePrototype);
        roles.forEach((role) => {
            let newRole = this.rolePrototype.cloneNode(false);
            newRole.value = role.type;
            newRole.innerHTML = role.name;
            this.roleField.appendChild(newRole);
        });
    }

    onMapAvailable() {
        this.map.setupFov();
        this.entrance = this.map.entrance;
        this.switchScreen(playScreen);
    }

    getMap() {
        return this.map;
    }

    key(x, y, z) {
        return '(' + x + ',' + y + ',' + z + ')';
    }

    posToKey(pos) {
        return this.key(pos.x, pos.y, pos.z);
    }

    addEntity(entity) {
        let key = this.posToKey(entity.pos);
        this.entities[key] = entity;
    }

    getItemsAt(x, y, z) {
        return this.items[this.key(x, y, z)];
    }

    takeItem(item) {
        this.socket.emit("take", item.name);
    }

    dropItem(item) {
        this.socket.emit("drop", item.name);
    }

    eat(item) {
        this.socket.emit("eat", item.name);
    }

    wieldItem(item) {
        let weapon = (item) ? item.name : null;
        this.socket.emit("wield", weapon);
    }

    wearItem(item) {
        let armour = (item) ? item.name : null;
        this.socket.emit("wear", armour);
    }

    addItem(item) {
        let key = this.posToKey(item.pos);
        if (this.items[key]) {
            this.items[key].push(item);
        } else {
            this.items[key] = [item];
        }
    }

    getEntityAt(x, y, z) {
        return this.entities[this.key(x, y, z)];
    }

    removeEntity(entity) {
        this.removeEntityAt(entity.pos);
    }

    removeEntityAt(pos) {
        let key = this.posToKey(pos);
        if (this.entities.hasOwnProperty(key)) {
            delete this.entities[key];
        };
    }

    moveEntity(entity, dest) {
        this.removeEntity(entity);
        entity.pos = dest;
        this.addEntity(entity);
    }

    hasChangedLevel(message) {
        return (message[0].search('level')>0);
    }

    addMessage(message) {
        this.messages.push(message);
        this.refresh();
    }

    connectToServer() {
        let properties = this.updateName();
        properties.type = "player";
        let socket = io(`${BASE_URL}`, {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true,
            transports: ['websocket'],
            query: properties,
        });
        this.registerEventHandlers(socket);
        socket.emit('map');
        socket.emit('get_items');
        this.socket = socket;
    }

    registerEventHandlers(socket) {
        socket.on('message', (message) => {
            if (this.hasChangedLevel(message)) {
                socket.emit('get_items');
            }
            this.addMessage(message);
        });

        socket.on('delete', (pos) => {
            this.removeEntityAt(pos);
            this.refresh();
        });

        socket.on('map', (data) => {
          this.map = new Map(data);
          this.onMapAvailable();
        });

        socket.on('items',(items) => {
            this.items = [];
            for (let pos in items) {
                let here = items[pos];
                here.forEach(item => {
                    let thing = new Item(item);
                    this.addItem(thing); 
                });
            }
        });

        socket.on('entities', (entities) => {
            for (let socket_id in entities) {
                if (socket_id !== socket.id) {
                    let npc = this.npcs[socket_id];
                    if (npc) {
                        npc.assume(entities[socket.id]);
                        this.moveEntity(npc, entities[socket_id].pos);
                    } else {
                        npc = new Entity(entities[socket_id]);
                        this.npcs[socket_id] = npc;
                        this.addEntity(npc);
                    }
                } else {
                    this.removeEntity(this.player);
                    this.player.assume(entities[socket.id]);
                    this.addEntity(this.player);
                }
            }
            this.refresh();
        });

        socket.on('update', (entity) => {
            this.player.assume(entity);
            this.refresh();
        });

        socket.on('dead', (entity) => {
            this.player.assume(entity);
            this.currentScreen.setGameEnded();
            this.refresh();
        });

        socket.on('position', (payload) => {
            let socket_id = payload[0];
            let pos = payload[1];
            if (socket_id === socket.id) {
                this.moveEntity(this.player, pos);
            } else {
                let npc = this.npcs[socket_id];
                if (npc) {
                    this.moveEntity(npc, pos);
                } else {
                    socket.emit('get_items');
                    socket.emit('get_entities');
                }
            }
            this.refresh();
        });
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

    refresh() {
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