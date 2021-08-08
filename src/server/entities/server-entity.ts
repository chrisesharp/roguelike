import { Item } from '../../common/item';
import { Tile } from '../../common/tile';
import { Location } from "../../common/movement";
import { Entity, EntityProperties } from '../../common/entity';
import { MSGTYPE, Messages } from '../messages';
import { Rules, RulesProperties } from '../rules';

export type Messenger = (subject: ServerEntity, msgType: MSGTYPE, msg: string) => void;

export interface ServerEntityProperties extends RulesProperties, EntityProperties {
    corpse?: Item;
    hitBonus?: number;
    messenger: Messenger;
}

export class ServerEntity extends Entity {
    corpse?: Item;
    private readonly rules: Rules;
    readonly messenger: Messenger;
    private readonly hitBonus;
    private readonly base_ac;

    entrance?: Location;

    constructor(properties: ServerEntityProperties) {
        super(Object.assign({ ac: 10, damage: 1 }, properties));
        
        this.base_ac = this.getAC();
        this.corpse = properties.corpse;
        this.rules = new Rules(properties);
        this.messenger = properties.messenger;
        this.hitBonus = properties.hitBonus || 0;
    }

    handleCollision(other: ServerEntity | Item[]): void {
        if (other instanceof Array) {
            const msg = (other.length === 1) ? Messages.SINGLE_ITEM(other[0]) : Messages.MULTIPLE_ITEMS();
            this.messenger(this, MSGTYPE.INF, msg);
        } else if (other.isAlive()) {
            if (this.isWielding()) {
                this.attack(other);
            } else {
                this.messenger(this, MSGTYPE.INF, Messages.ENTITY_THERE(other));
            }
        } else {
            this.messenger(this, MSGTYPE.INF, Messages.ENTITY_DEAD(other));
        }
    }

    attack(other: ServerEntity): void {
        if (this.tryToHit(other)) {
            const dmg = this.dealDamage();
            other.hitFor(dmg);
            this.messenger(this, MSGTYPE.INF, Messages.HIT_BY(other, dmg));
            this.messenger(other, MSGTYPE.INF, Messages.HIT_OTHER(this, dmg));
        } else {
            this.messenger(this, MSGTYPE.INF, Messages.YOU_MISSED(other));
            this.messenger(other, MSGTYPE.INF, Messages.MISSED_YOU(this));
        }
    }

    exertion(effort: number): void {
        const hunger = this.getHunger().getValue() + effort / 20;
        this.setHungerValue(hunger);
    }

    toHitBonus(): number {
        return this.hitBonus;
    }

    tryToHit(other: Entity): boolean {
        this.exertion(1);
        return this.rules.toHitRoll(this, other);
    }

    tryDigging(tile: Tile): boolean {
        this.exertion(2);
        return (this.isWielding() && tile.isDiggable());
    }

    hitFor(damage: number): void {
        this.hitPoints -= damage;
        if (this.isAlive()) {
            this.messenger(this, MSGTYPE.UPD, Messages.TAKE_DMG());
        } else {
            this.messenger(this, MSGTYPE.UPD, Messages.DIED());
        }   
    }

    tryTake(item: Item): boolean {
        this.inventory.push(item);
        this.messenger(this, MSGTYPE.UPD, Messages.TAKE_ITEM(item));
        return true;
    }

    dealDamage(): number {
        let damage = this.getDamage();
        if (this.currentWeapon) {
            damage += this.currentWeapon.getDamage();
        }
        return damage;
    }

    private removeItemFromInventory(itemName: string): Item | undefined {
        let item: Item | undefined;
        for (let i=0; i< this.inventory.length; i++) {
            if (this.inventory[i].getName() === itemName) {
                item = this.inventory.splice(i,1)[0];
                break;
            }
        }
        return item;
    }

    dropItem(itemName: string): Item | undefined {
        const item = this.removeItemFromInventory(itemName);
        if (item) {
            if (this.currentArmour === item) {
                this.wear();
            } else if (this.currentWeapon === item) {
                this.wield();
            }
            this.messenger(this, MSGTYPE.UPD, Messages.DROP_ITEM(item));
        }
        return item;
    }

    dropCorpse(): Item | undefined {
        const corpse = this.corpse;
        this.corpse = undefined;
        return corpse;
    }

    eat(foodName: string): void {
        const item = this.removeItemFromInventory(foodName);
        if (item) {
            this.messenger(this, MSGTYPE.UPD, Messages.EAT_FOOD(item));
        } else {
            this.messenger(this, MSGTYPE.INF, Messages.NO_EAT(foodName));
        }
    }

    wield(weaponName?: string): void {
        if (weaponName) {
            this.use(weaponName, "wield");
        } else {
            this.currentWeapon = undefined;
            this.messenger(this, MSGTYPE.UPD, Messages.NO_WIELD());
        }
    }

    wear(armourName?: string): void {
        if (armourName) {
            this.use(armourName, "wear");
        } else {
            this.updateAC();
            this.messenger(this, MSGTYPE.UPD, Messages.NO_WEAR());
        }
    }

    private use(itemName: string, verb: string): void {
        const item = this.inventory.find(o => (o.getName() === itemName));
        if (item) {
            if (item.isWearable()) {
                this.updateAC(item);
            } else {
                this.currentWeapon = item;
            }
            this.messenger(this, MSGTYPE.UPD, Messages.USE_ITEM(verb, item));
        } else {
            this.messenger(this, MSGTYPE.INF, Messages.NO_USE(verb, itemName));
        }
    }

    isWielding(): boolean {
        return this.currentWeapon !== undefined;
    }

    getEntityLocation(): { id: string; pos: Location } {
        return {
            id: this.id,
            pos:this.getPos(),
        };
    }

    private updateAC(armour?: Item): void {
        this.currentArmour = armour;
        let ac = this.base_ac;
        if (this.currentArmour) {
            ac += this.currentArmour.getAC();
        }
        this.setAC(ac);
    }
}