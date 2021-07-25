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
        this.startPos =  (config.startPos) ? config.startPos : {z:this.level - 1};
        const props =  {
            name: this.name,
            role: this.role,
            pos: JSON.stringify(this.startPos),
        };
        this.start(props, config.callback);
        return this;
    }
}