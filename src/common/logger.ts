export class Logger {
    private service:string;
    private debugMode = false;

    constructor() {
        this.service = process.env.npm_package_name||'Roguelike';
        this.debugMode = (process.env.DEBUG?.toLowerCase() === 'true')  || false;
    }



    info(message:string) :void {
        console.log(`${this.service}| INFO | ${message}`);
    }

    debug(message:string, ...objects:unknown[]) : void {
        if (this.debugMode) { 
            console.log(`${this.service}| DEBUG | ${message}`);
            objects.forEach( (o) => {
                console.log(o);
            });
        }
    }

    error(message:string, ...objects:unknown[]) : void {
        console.log(`${this.service}| ERROR| ${message}`);
        objects.forEach( (o) => {
            console.log(`${this.service}| ERROR |`,o);
        });
    }
}