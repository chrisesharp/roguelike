import { Bot, BotProperties }  from './bot';
import { GoblinBrain } from './goblin-brain';
import { Brain } from './brain';

export class GoblinBot extends Bot {
    role = 'goblin';
    level = 1;
    name = "Goblin";

    constructor(URL: string, brain?: Brain) {
        super(URL, brain);
        if (!brain) {
            this.setBrain(new GoblinBrain(undefined, this.client, this.messages));
        } 
    }

    startBot(config: BotProperties = {}): this {
        return super.startBot(this.augmentedConfig(config));
    }

    augmentedConfig(config:BotProperties): BotProperties {
        this.startPos =  (config.startPos) ? config.startPos : {z:this.level - 1};
        config.name = this.name;
        config.role = this.role;
        config.pos = JSON.stringify(this.startPos);
        return config;
    }
}