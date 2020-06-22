"use strict";

import { game } from '../game.js';
import { isReturnKey, isEscKey, isZeroKey, isLetterKey, letterIndex } from '../keys.js';
import Item from '../item.js';

export default class ItemListScreen {
    constructor(template) {
        this.caption = template['caption'];
        this.okFunction = template['ok'];
        this.isAcceptableFunction = template['isAcceptable'] || function(x) {return x;};
        this.canSelectItem = template['canSelect'];
        this.canSelectMultipleItems = template['canSelectMultipleItems'];
        this.hasNoItemOption = template['hasNoItemOption'];
    }

    setup(player, items) {
        this.player = player;
        let count = 0;
        this.items = items.map( (item) => {
            item = new Item(item);
            if (this.isAcceptableFunction(item)) {
                count++;
                return item;
            }
            return null;
        });
        this.selectedIndices = {};
        return count;
    }

    render(display) {
        let row = 0;
        display.drawText(0, row++, this.caption);
        if (this.hasNoItemOption) {
            display.drawText(0, row++, '0 - no item');
        }

        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i]) {
                let option = game.getOption(i);

                let selectionState = (this.canSelectItem && this.canSelectMultipleItems &&
                    this.selectedIndices[i]) ? '+' : '-';

                let suffix = '';
                if (this.items[i].name === this.player.getArmour()) {
                    suffix = ' (wearing)';
                } else if (this.items[i].name === this.player.getWeapon()) {
                    suffix = ' (wielding)';
                }
                display.drawText(0, row++,  option + ' ' + selectionState + ' ' +
                    this.items[i].getDescription() + suffix);
            }
        }
    }

    executeOkFunction() {
        let selectedItems = {};
        for (let key in this.selectedIndices) {
            selectedItems[key] = this.items[key];
        }

        game.getScreen().setSubScreen(undefined);
        this.okFunction(selectedItems);
    }

    handleInput(inputType, inputData) {
        if (this.isCancelCondition(inputData)) {
            game.getScreen().setSubScreen(undefined);
        } else if (isReturnKey(inputData)) {
            this.executeOkFunction();
        } else if (this.zeroSelected(inputData)) {
            this.selectedIndices = {};
            this.executeOkFunction();
        } else if (this.letterSelected(inputData) && this.hasItem(inputData.keyCode)) {
            let index = this.keyToIndex(inputData.keyCode);
            if (this.canSelectMultipleItems) {
                if (this.selectedIndices[index]) {
                    delete this.selectedIndices[index];
                } else {
                    this.selectedIndices[index] = true;
                }
                game.refresh();
            } else {
                this.selectedIndices[index] = true;
                this.executeOkFunction();
            }
        }
    }

    isCancelCondition(inputData) {
        return (isEscKey(inputData) || 
                    (isReturnKey(inputData) && 
                        (!this.canSelectItem || 
                        Object.keys(this.selectedIndices).length === 0)
                    )
                );
    }

    zeroSelected(inputData) {
        return (this.canSelectItem && this.hasNoItemOption && isZeroKey(inputData));
    }

    letterSelected(inputData) {
        return (this.canSelectItem && isLetterKey(inputData));
    }

    hasItem(keyCode) {
        return (this.items[this.keyToIndex(keyCode)] !== null);
    }

    keyToIndex(keyCode) {
        return letterIndex(keyCode);
    }
};

export const inventoryScreen = new ItemListScreen({
    caption: 'Inventory',
    canSelect: false
});

export const pickupScreen = new ItemListScreen({
    caption: 'Choose the items you wish to pickup',
    canSelect: true,
    canSelectMultipleItems: true,
    ok: function(selectedItems) {
        Object.keys(selectedItems).forEach(item => {
            game.takeItem(selectedItems[item]);
        });
        return false;
    }
});

export const dropScreen = new ItemListScreen({
    caption: 'Choose the items you wish to drop',
    canSelect: true,
    canSelectMultipleItems: true,
    ok: function(selectedItems) {
        Object.keys(selectedItems).forEach(item => {
            game.dropItem(selectedItems[item]);
        });
        return true;
    }
});

export const examineScreen = new ItemListScreen({
    caption: 'Choose the item you wish to examine',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return true;
    },
    ok: function(selectedItems) {
        let key = Object.keys(selectedItems)[0];
        let item = selectedItems[key];
        game.addMessage(`It's ${item.describeA(false)} (${item.getDetails()}).`);
        return false;
    }
});

export const eatScreen = new ItemListScreen({
    caption: 'Choose the item you wish to eat',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return item && item.isEdible();
    },
    ok: function(selectedItems) {
        let key = Object.keys(selectedItems)[0];
        let item = selectedItems[key];
        game.eatItem(item);
        return false;
    }
});

export const wieldScreen = new ItemListScreen({
    caption: 'Choose the item you wish to wield',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable: function(item) {
        return item && item.isWieldable();
    },
    ok: function(selectedItems) {
        let key = Object.keys(selectedItems)[0];
        let weapon = selectedItems[key];
        game.wieldItem(weapon);
        return false;
    }
});

export const wearScreen = new ItemListScreen({
    caption: 'Choose the item you wish to wear',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable: function(item) {
        return item && item.isWearable();
    },
    ok: function(selectedItems) {
        let key = Object.keys(selectedItems)[0];
        let armour = selectedItems[key];
        game.wearItem(armour);
        return false;
    }
});