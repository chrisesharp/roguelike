import { startServer } from './start-server';
import { startMonsters, StartMonsterOpts, MonsterRoster } from './start-monsters';

console.log("Starting...");
if (process.env.ROLE === "MONSTERS") {
    console.log("...monsters!");
    const monsters = process.env.monsters;
    const opts:StartMonsterOpts = (monsters) ? {monsters: JSON.parse(monsters) as MonsterRoster[]} : {};
    startMonsters(opts);
} else {
    console.log("...the kaverns!");
    startServer();
}