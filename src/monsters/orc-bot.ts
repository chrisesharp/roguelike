import { Bot }  from './bot';
import { GoblinBrain } from './goblin-brain';
import { Brain } from './brain';
import { Location } from '../common/location';

const level = 2;
export class OrcBot extends Bot {
    role = 'orc';

    constructor(URL: string, brain?: Brain) {
        super(URL, brain);
        if (!brain) {
            this.setBrain(new GoblinBrain(undefined, this.client, this.messages));
        } 
    }

    startBot(startPos: Location, callback: (() => void)): this {
          this.startPos =  (startPos) ? startPos : {z:level - 1};
          const props =  {
              name: OrcBot.name,
              role: this.role,
              pos: JSON.stringify(this.startPos),
          };props.pos = JSON.stringify(this.startPos)
        super.start(props, callback);
        return this;
    }
}