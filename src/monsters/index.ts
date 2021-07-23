import { GoblinBot } from './goblin-bot';
import { OrcBot } from './orc-bot';
import { Brain } from './brain';
import { Bot } from './bot';

export interface BotTypes {
    [key: string]: {
        newInstance: (URL: string, brain?: Brain) => Bot;
        numberOccurring: number;
        name: string
    }
}

export const Bots: BotTypes = {
    goblin: {
        newInstance: (URL: string, brain?: Brain) => new GoblinBot(URL, brain),
        numberOccurring: 3,
        name: "Goblin"
    },
    orc: {
        newInstance: (URL: string, brain?: Brain) => new OrcBot(URL, brain),
        numberOccurring: 3,
        name: "Orc",
    },
};