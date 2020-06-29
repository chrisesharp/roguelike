"use strict";
import axios from 'axios';

export default class ServerHealth {
    constructor(url) {
        this.url = url;
    }

    initServerHealth(field) {
        this.health = field;
        this.getServerHealth();
    }

    getServerHealth() {
        let monitor = this;
        axios.get(this.url,{
                timeout: 2500
            }).then( (result) => {
                monitor.updateServerHealth(result.data.status);
            }).catch( (error) => {
                monitor.updateServerHealth("DOWN");
            }).then( () => {
                setTimeout((function() {
                    monitor.getServerHealth();
                }), 15000);
            });
    }

    updateServerHealth(state) {
        this.health.innerHTML = "Status:"+ state;
        switch (state) {
            case "UP":
                this.health.style.color = "green";
                break;
            case "DOWN":
                this.health.style.color = "red";
                break;
            default:
                this.health.style.color = "orange";
        }
    }
}