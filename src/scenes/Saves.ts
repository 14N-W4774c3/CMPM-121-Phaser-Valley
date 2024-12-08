export interface PlayerPosition {
    positionX: number;
    positionY: number;
}

export interface Cell {
    water: number;
    sun: number;
    plantType: number;
    growthLevel: number;
}

export interface GameState {
    player: PlayerPosition;
    money: number;
    days: number;
    grid: Cell[];
}

export interface SaveData {
    discriminator: "SaveData";
    currentState: GameState;
    undoStack: ArrayBuffer[];
    redoStack: ArrayBuffer[];
    gridSize: number;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binaryString = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binaryString += String.fromCharCode(bytes[i]);
    }
    return globalThis.btoa(binaryString);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = globalThis.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export function toArrayBuffer(currentState: GameState): ArrayBuffer {
    const buffer = new ArrayBuffer(58);
    const view = new DataView(buffer);
    view.setInt16(0, currentState.player.positionX, true);
    view.setInt16(2, currentState.player.positionY, true);
    view.setInt16(4, currentState.money, true);
    view.setInt16(6, currentState.days, true);
    for (let i = 0; i < currentState.grid.length; i++) {
        const cell = currentState.grid[i];
        const cellValue = cell.water * 1000 + cell.sun * 100 + cell.plantType * 10 + cell.growthLevel;
        view.setInt16(8 + i * 2, cellValue, true);
    }
    return buffer;
}

export function fromArrayBuffer(buffer: ArrayBuffer, gridSize: number): GameState {
    const view: DataView = new DataView(buffer);
    const row: number = view.getInt16(0, true);
    const col: number = view.getInt16(2, true);
    const player: PlayerPosition = { positionX: row, positionY: col };
    const money: number = view.getInt16(4, true);
    const days: number = view.getInt16(6, true);
    const grid: Cell[] = [];
    for (let i = 0; i < gridSize; i++) {
        const cellValue = view.getInt16(8 + i * 2, true);
        const cell: Cell = grid[i];
        cell.water = Math.floor(cellValue / 1000);
        cell.sun = Math.floor(cellValue % 1000 / 100);
        cell.plantType = Math.floor(cellValue % 100 / 10);
        cell.growthLevel = Math.floor(cellValue % 10);
        grid[i] = cell;
    }
    const newState: GameState = { player, money, days, grid };
    return newState;
}

export function stackToBase64(stack: ArrayBuffer[]) {
    let base64 = "";
    for (const buffer of stack) {
      base64 += arrayBufferToBase64(buffer) + "@";
    }
    return base64;
}

export function base64ToStack(base64: string) {
    const stack = [];
    const bufferStrings = base64.split("@");
    for (const bufferString of bufferStrings) {
      if (bufferString) {
        stack.push(base64ToArrayBuffer(bufferString));
      }
    }
    return stack;
}

export function saveToLocalStorage(key: string, undoStack: ArrayBuffer[], redoStack: ArrayBuffer[]) {
    const undoString = stackToBase64(undoStack);
    const redoString = stackToBase64(redoStack);
    const save = undoString + "|" + redoString;
    localStorage.setItem(key, save);
}

export function readFromLocalStorage(key: string, gridSize: number): SaveData | undefined {
    const save = localStorage.getItem(key);
    if (!save) {
        return;
    }
    const [undoString, redoString] = save.split("|");
    const undoStack = base64ToStack(undoString);
    const redoStack = base64ToStack(redoString);
    const savedState = undoStack[undoStack.length - 1];
    const currentState: GameState = fromArrayBuffer(savedState, gridSize);
    const discriminator = "SaveData";
    const newState: SaveData = { discriminator, currentState, undoStack, redoStack, gridSize };
    return newState;
}

export class ContinueMenu extends Phaser.Scene {
    buttonPressed: boolean = false;
    buttonAutosave: Phaser.GameObjects.Sprite = this.add.sprite(400, 200, "buttonGraphic").setScale(2, 1);
    buttonSave1: Phaser.GameObjects.Sprite = this.add.sprite(400, 275, "buttonGraphic").setScale(2, 1);
    buttonSave2: Phaser.GameObjects.Sprite = this.add.sprite(400, 350, "buttonGraphic").setScale(2, 1);
    buttonSave3: Phaser.GameObjects.Sprite = this.add.sprite(400, 425, "buttonGraphic").setScale(2, 1);

    constructor() {
      super("continueMenuScene");
    }

    create(){
        this.add.text(360, 75, "Load a Save", {
            fontFamily: 'Arial', 
            fontSize: '24px', 
        });
        this.buttonAutosave.setInteractive();
        this.buttonSave1.setInteractive();
        this.buttonSave2.setInteractive();
        this.buttonSave3.setInteractive();
        this.add.text(370, 190, "Autosave");
        this.add.text(370, 265, "Save 1");
        this.add.text(370, 340, "Save 2");
        this.add.text(370, 415, "Save 3");
    }

    override update(){
        // Button Handlers
        this.buttonAutosave.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            const newSave: SaveData | undefined = readFromLocalStorage("autosave", 0);
            this.scene.start("playScene", newSave);
        });
        this.buttonSave1.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            const newSave: SaveData | undefined = readFromLocalStorage("save1", 0);
            this.scene.start("playScene", newSave);
        });
        this.buttonSave2.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            const newSave: SaveData | undefined = readFromLocalStorage("save2", 0);
            this.scene.start("playScene", newSave);
        });
        this.buttonSave3.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            const newSave: SaveData | undefined = readFromLocalStorage("save3", 0);
            this.scene.start("playScene", newSave);
        });
    }
}

export class SaveMenu extends Phaser.Scene {
    buttonPressed: boolean = false;
    buttonSave1: Phaser.GameObjects.Sprite = this.add.sprite(400, 200, "buttonGraphic").setScale(2, 1);
    buttonSave2: Phaser.GameObjects.Sprite = this.add.sprite(400, 275, "buttonGraphic").setScale(2, 1);
    buttonSave3: Phaser.GameObjects.Sprite = this.add.sprite(400, 350, "buttonGraphic").setScale(2, 1);
    buttonBack: Phaser.GameObjects.Sprite = this.add.sprite(400, 425, "buttonGraphic").setScale(2, 1);
    undoStack: ArrayBuffer[] = [];
    redoStack: ArrayBuffer[] = [];

    constructor() {
      super("saveMenuScene");
    }

    init (data: SaveData){
        this.undoStack = data.undoStack;
        this.redoStack = data.redoStack;
    }

    create(){
        this.add.text(360, 75, "Save Game", {
            fontFamily: 'Arial', 
            fontSize: '24px', 
        });
        this.buttonSave1.setInteractive();
        this.buttonSave2.setInteractive();
        this.buttonSave3.setInteractive();
        this.buttonBack.setInteractive();
        this.add.text(370, 190, "Save 1");
        this.add.text(370, 265, "Save 2");
        this.add.text(370, 340, "Save 3");
        this.add.text(370, 415, "Go Back");
    }

    override update(){
        // Button Handlers
        this.buttonSave1.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            saveToLocalStorage("save1", this.undoStack, this.redoStack);
            this.scene.resume("playScene");
            this.scene.stop();
        });
        this.buttonSave2.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            saveToLocalStorage("save2", this.undoStack, this.redoStack);
            this.scene.resume("playScene");
            this.scene.stop();
        });
        this.buttonSave3.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            saveToLocalStorage("save3", this.undoStack, this.redoStack);
            this.scene.resume("playScene");
            this.scene.stop();
        });
        this.buttonBack.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            this.scene.resume("playScene");
            this.scene.stop();
        });
    }
}

export class LoadMenu extends Phaser.Scene {
    buttonPressed: boolean = false;
    buttonAutosave: Phaser.GameObjects.Sprite = this.add.sprite(400, 200, "buttonGraphic").setScale(2, 1);
    buttonSave1: Phaser.GameObjects.Sprite = this.add.sprite(400, 275, "buttonGraphic").setScale(2, 1);
    buttonSave2: Phaser.GameObjects.Sprite = this.add.sprite(400, 350, "buttonGraphic").setScale(2, 1);
    buttonSave3: Phaser.GameObjects.Sprite = this.add.sprite(400, 425, "buttonGraphic").setScale(2, 1);
    buttonBack: Phaser.GameObjects.Sprite = this.add.sprite(400, 500, "buttonGraphic").setScale(2, 1);
    gridSize: number = 0;
    currentState: GameState = { player: { positionX: 0, positionY: 0 }, money: 0, days: 0, grid: [] };
    currentSave: SaveData = { discriminator: "SaveData", currentState: this.currentState, 
        undoStack: [], redoStack: [], gridSize: 0 };

    constructor() {
      super("loadMenuScene");
    }

    init (data: SaveData){
        this.gridSize = data.gridSize;
        this.currentSave = data;
    }

    create(){
        this.add.text(360, 75, "Load Save", {
            fontFamily: 'Arial', 
            fontSize: '24px', 
        });
        this.buttonAutosave.setInteractive();
        this.buttonSave1.setInteractive();
        this.buttonSave2.setInteractive();
        this.buttonSave3.setInteractive();
        this.buttonBack.setInteractive();
        this.add.text(370, 190, "Autosave");
        this.add.text(370, 265, "Save 1");
        this.add.text(370, 340, "Save 2");
        this.add.text(370, 415, "Save 3");
        this.add.text(370, 490, "Go Back");
    }

    override update(){
        // Button Handlers
        this.buttonAutosave.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            const newSave: SaveData | undefined = readFromLocalStorage("autosave", this.gridSize);
            this.scene.resume("playScene", newSave);
            this.scene.stop();
        });
        this.buttonSave1.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            const newSave: SaveData | undefined = readFromLocalStorage("save1", this.gridSize);
            this.scene.resume("playScene", newSave);
            this.scene.stop();
        });
        this.buttonSave2.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            const newSave: SaveData | undefined = readFromLocalStorage("save2", this.gridSize);
            this.scene.resume("playScene", newSave);
            this.scene.stop();
        });
        this.buttonSave3.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            const newSave: SaveData | undefined = readFromLocalStorage("save3", this.gridSize);
            this.scene.resume("playScene", newSave);
            this.scene.stop();
        });
        this.buttonBack.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true
            this.scene.resume("playScene");
            this.scene.stop();
        });
    }
}
