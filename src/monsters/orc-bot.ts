import { Bot, BotProperties }  from './bot';
import { GoblinBrain } from './goblin-brain';
import { Brain } from './brain';


export class OrcBot extends Bot {
    role = 'orc';
    level = 2;
    name = "Orc";

    constructor(URL: string, brain?: Brain) {
        super(URL, brain);
        if (!brain) {
            this.setBrain(new GoblinBrain(undefined, this.client, this.messages));
        } 
    }

    startBot(config: BotProperties): this {
          this.startPos =  (config.startPos) ? config.startPos : {z:this.level - 1};
          const props =  {
              name: this.name,
              role: this.role,
              pos: JSON.stringify(this.startPos),
          };props.pos = JSON.stringify(this.startPos)
        super.start(props, config.callback);
        return this;
    }
}