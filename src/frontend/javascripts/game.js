"use strict";
import 'regenerator-runtime/runtime.js'
import axios from 'axios';
import ServerHealth from './server-health';
import ExplorerMap from './explorer-map';
import { EntityClient } from '../../client/entity-client';
import { EVENTS } from '../../common/events';

import { OurDisplay, dispOpts } from './display';
import { loginScreen } from './screens/login';
import { playScreen } from './screens/play.js'
import { spectateScreen } from './screens/spectate.js';
// import { GameMap } from '../../common/map';

const hostname = location.host;
const BASE_URL = 'http://'+hostname;
const DEFAULT_ROLES = [
    {type:"warrior",name:"Warrior"}
];
const DEFAULT_CAVE = [
    {id:0, name:"Starting Cave",url:BASE_URL}
];

class Game {
    constructor() {
        this.currentScreen = null;
        this.nameInput= null;
        this.roleINput = null;
        this.caveInput = null;

        this.screenWidth =  dispOpts.width,
        this.screenHeight = dispOpts.height - 1,
        this.display = null;
        this.title = " Kaverns & Kubernetes ";
        this.client = new EntityClient(BASE_URL,(event, data) => {this.refresh(event, data);});
        this.messages = [];
        this.spectatorOnly = false;

        const bindEventToScreen = (event) => {
            window.addEventListener(event, function(e) {
                if (!$('#chatText').is(":focus") && game.currentScreen !== null) {
                    game.currentScreen.handleInput(event, e);
                }
            });
        };
        bindEventToScreen('keydown');
        bindEventToScreen('keypress');
    }

    initDisplay() {
        if (dispOpts.layout === 'tile') {
            const tileset = document.getElementById("tileset");
            dispOpts.tileSet = tileset;
        }
        this.display = new OurDisplay(dispOpts);
    }

    start(nameField, messageField, statsField) {
        this.nameField = nameField;
        this.messageField = messageField;
        this.statsField = statsField;
        this.switchScreen(loginScreen);
    }

    initRoles(roleField) {
        this.origRoleInput = roleField.clone();
        axios.get(`${BASE_URL}/roles`,{
                timeout: 2500
            }).then( (result) => {
                game.updateRolesOptions(result.data, roleField);
            }).catch( (err) => {
                console.log("Err:",err);
                game.updateRolesOptions(DEFAULT_ROLES. roleField);
            });
    }

    initCaves(caveField) {
        this.origCaveInput = caveField.clone();
        axios.get(`${BASE_URL}/caves`,{
                timeout: 2500
            }).then( (result) => {
                game.updateCaveOptions(result.data, caveField);
            }).catch( (err) => {
                console.log("Err:",err);
                game.updateCaveOptions(DEFAULT_CAVE, caveField);
            });
    }

    updateRolesOptions(roles, roleField) {
        roles.forEach((role) => {
            const newRole = $("<option></option>");
            newRole.addClass("role");
            newRole.val(role.type);
            newRole.text(role.name);
            roleField.append(newRole)
        });
    }

    updateCaveOptions(caves, caveField) {
        caves.forEach((cave) => {
            const newCave = $(`<option id=${cave.id}></option>`);
            newCave.val(cave.url);
            newCave.text(cave.name);
            caveField.append(newCave);
        });
        const elswhere = $(`<option id="-99">Other Location</option>`);
        caveField.append(elswhere);
    }

    mapAvailable(map) {
        this.map = new ExplorerMap(map);
        if (this.spectatorOnly) {
            this.switchScreen(spectateScreen);
        } else {
            this.map.setupFov();
            this.switchScreen(playScreen);
        }
    }

    getMap() {
        return this.map;
    }

    getEntrance() {
        return this.map.getEntrance();
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
        if (properties.role === "spectator") {
            this.spectatorOnly = true;
        }
        backendMonitor.setServerURL(`${properties.url}/health`);
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
        if (event === EVENTS.reconnect) {
            this.currentScreen.showTeleportScreen();
            return;
        }
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
        if (this.currentScreen && this.currentScreen !== screen) {
            this.currentScreen.exit();
        }
        this.currentScreen = screen;
        if (this.currentScreen) {
            this.currentScreen.enter();
            this.refresh();
        }
    }

    updateStats(stats) {
        game.statsField.find("#hp").text(`HP:${stats.hp}/${stats.max}`);
        game.statsField.find("#ac").text(`AC:${stats.ac}`);
        game.statsField.find("#lvl").text(`LVL:${stats.lvl}`);
        game.statsField.find("#gp").text(`GP:${stats.gp}`);
        game.statsField.find("#hunger").text(`${stats.hunger}`);
    }

    setStats(stats) {
        game.statsField.html(stats);
    }

    setNameField(nameInput, roleInput, caveInput) {
        let name = nameInput.val();
        let role = roleInput.val();
        let cave = caveInput.val();
        this.nameField.text(`${name} (${role})`);
        return {name:name, role:role, url:cave};
    }

    getNameField() {
        return this.nameField.find("#name_input");
    }

    getRoleField() {
        return this.nameField.find("#role_input");
    }
    
    getCaveField() {
        const cave = this.nameField.find("#cave_input").find(':selected');
        const otherURL = this.nameField.find("#other_url");
        return (cave.attr('id') < 0) ? otherURL : cave;
    }

    hideInputFields(...fields) {
        fields.forEach(field => {
            field.remove();
        });
        this.addChatButton();
    }

    addChatButton() {
        const chat = $('.chat');
        chat.append("<input type='text' id='chatText'>");
        chat.append("<button type='button' id='chatButton'>Shout!</button>");
        chat.on('keypress',(e)=>{
            if(e.which === 13) {
                const message = $("#chatText").val();
                game.client.sendMessage(message);
                $("#chatText").val("");
            }
        });
        $('#chatButton').on("click", ()=> {
            const message = $("#chatText").val();
            game.client.sendMessage(message);
            $("#chatText").val("");
        });
    }

    unhideInputFields() {
        const name = $('#name');
        name.text("");
        const nameInput = $('<input class="centred" id="name_input" type="text" placeholder="Your name" ></input>');
        const otherURL = $('<input class="centred" id="other_url" type="text">');
        otherURL.hide();

        this.origCaveInput.on('change', (event) => {
            const idx = event.currentTarget.options.selectedIndex;
            const selected = $(event.currentTarget.options[idx]).attr('id');
            if (selected < 0) {
                otherURL.show();
            } else {
                otherURL.hide();
            }
        });
        if (name.children().length === 0) {
            name.append(nameInput);
            name.append(this.origRoleInput);
            name.append(this.origCaveInput);
            name.append(otherURL);
            game.initRoles(this.origRoleInput);
            game.initCaves(this.origCaveInput);
        }
        $('input[id="name_input"]').trigger('focus');
    }

    updateName() {
        const nameInput = this.getNameField();
        const roleInput = this.getRoleField();
        const caveInput = this.getCaveField();
        this.hideInputFields(nameInput, roleInput);
        return this.setNameField(nameInput, roleInput, caveInput);
    }

    updateMessages(text) {
        const newMessage = $('<scroll-page class="message"></scroll-page>').text(text);
        this.messageField.append(newMessage);
        this.messageField.scrollTop(this.messageField.prop("scrollHeight"));
    }

    clearMessageField() {
        this.messageField.empty();
    }

    getScreen() {
        return this.currentScreen;
    }

    getEntity() {
        return this.client.getEntity();
    }

    getOtherEntities() {
        return this.client.getOtherEntities();
    }
}

export const game = new Game();

const stats = $('#stats_pane');
const name = $('#name');
const messages = $('#messages');
const status1 = document.getElementById('frontend-status');
const status2 = document.getElementById('backend-status');
const frontendMonitor = new ServerHealth("Front-End", `${BASE_URL}/health`);
const backendMonitor = new ServerHealth("Back-End", `${BASE_URL}/health`);

$(() => {
        game.initDisplay();
        $('#playfield').append(game.getDisplay().getContainer());
        frontendMonitor.initServerHealth(status1);
        backendMonitor.initServerHealth(status2);
        game.initRoles($('#role_input'));
        game.initCaves($('#cave_input'));
        game.start(name, messages, stats);
});