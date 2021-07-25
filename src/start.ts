import { startServer } from './start-server';
import { startMonsters } from './start-monsters';


console.log("Starting...");
if (process.env.ROLE === "MONSTERS") {
    console.log("...monsters!");
    startMonsters();
} else {
    console.log("...the kaverns!");
    startServer();
}