import { GoblinBot } from './goblin-bot';
import { OrcBot } from './orc-bot';
import { Brain } from './brain';
import { Bot } from './bot';

export interface BotTypes {
    [key: string]: {
        newInstance: (URL: string, brain?: Brain) => Bot;
        numberOccurring: number;
    }
}

export const Bots: BotTypes = {
    goblin: {
        newInstance: (URL: string, brain?: Brain) => new GoblinBot(URL, brain),
        numberOccurring: 3,
    },
    orc: {
        newInstance: (URL: string, brain?: Brain) => new OrcBot(URL, brain),
        numberOccurring: 3,
    },
};