// deno-lint-ignore-file
import { Player } from "../prefabs/Player.ts";
import jsyaml from "js-yaml";
import { PlayerPosition, Cell, GameState, SaveData, saveToLocalStorage } from "../scenes/Saves.ts";

interface CellData {
    row: number;
    col: number;
    rect: Phaser.GameObjects.Rectangle;
    border: Phaser.GameObjects.Rectangle;
    sun: number;
    water: number;
    hasPlant: boolean;
    plantType: number;
    growthLevel: number;
    plantSprite: Phaser.GameObjects.Sprite | null;
}

interface Plant {
    type: string;
    cost: number;
    price: number;
    sunNeed: number;
    waterNeed: number;
    maxGrowth: number;
}

export class Play extends Phaser.Scene {
    // Variables
    width: number = 800;
    height: number = 600;
    textConfig: any = {
        fill: "#ffffff",
        fontSize: "32px",
        backgroundColor: "#D1C6B4",
    };
    reapConfig: any = {
        fill: "#ffffff",
        fontSize: "48px",
        backgroundColor: "#D1C6B4",
    };
    sowConfig: any = {
        fill: "#ffffff",
        fontSize: "24px",
        backgroundColor: "#D1C6B4",
    };
    dayCountText: Phaser.GameObjects.Text = this.add.text(10, 5, "", { fontSize: 36 });
    nextDayButton: Phaser.GameObjects.Text = this.add.text(this.width / 1.3, 10, "Next Day", this.textConfig);
    undoButton: Phaser.GameObjects.Text = this.add.text(this.width * 0.075, this.height - 40, "Undo", this.textConfig);
    redoButton: Phaser.GameObjects.Text = this.add.text(this.width * 0.625, this.height - 40, "Redo", this.textConfig);
    saveButton: Phaser.GameObjects.Text = this.add.text(this.width * 0.6, 15, "Save", this.textConfig);
    loadButton: Phaser.GameObjects.Text = this.add.text(this.width * 0.45, 15, "Load", this.textConfig);
    playerMoney: Phaser.GameObjects.Text = this.add.text(this.width / 1.45, 50, "", { fontSize: 24 });
    displayPosition: Phaser.GameObjects.Text = this.add.text(this.width / 1.45, 80, "", { fontSize: 24 });
    days: number = 0;
    money: number = 10;
    undoStack: ArrayBuffer[] = [];
    redoStack: ArrayBuffer[] = [];
    loadedSave: any;
    landColor: number = 0x7ac769;
    gridConfig: any;
    grid: any;
    plant: Plant[] = [];
    winCondition: number = 0;
    playerX: number = 0;
    playerY: number = 0;
    player: Player;
    selectCell: any;
    cellInfo: Phaser.GameObjects.Text = this.add.text(this.width / 1.45, 130, "", { fontSize: 24 });
    keys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    constructor() {
        super("playScene");
        const gameConfig = jsyaml.load(this.cache.text.get("gameConfig"));
        this.gridConfig = { 
            width: gameConfig.GridConfig.Width, 
            height: gameConfig.GridConfig.this.height, 
            size: gameConfig.GridConfig.Size };
        if (this.input.keyboard){
            this.keys = this.input.keyboard.createCursorKeys();
        }
        this.player = new Player(this, this.playerX, this.playerY, "player", 0, this.gridConfig, this.keys).setDepth(3);
    }
    
    init(data: any) {
        // load from scenario
        const gameConfig = jsyaml.load(this.cache.text.get("gameConfig"));

        // load External DSL for player position
        this.playerX = gameConfig.playerPosition.x
        this.playerY = gameConfig.playerPosition.y;

        this.landColor = gameConfig.landColor;

        // load External DSL for grid size
        
        this.grid = [];

        // load External DSL for plant
        this.plant = [];
        gameConfig.plant.forEach((plant: Plant) => {
            this.plant.push({
                type: plant.type,
                cost: plant.cost,
                price: plant.price,
                sunNeed: plant.sunNeed, 
                waterNeed: plant.waterNeed,
                maxGrowth: plant.maxGrowth
            })
          });

        this.winCondition = gameConfig.winCondition;
        
        this.selectCell = null;

        this.loadedSave = data;
    }

    create() {
        this.createGrid();
        
        this.nextDayButton.setInteractive()
        .on("pointerdown", () => {  
            this.updateDayCountText(++this.days),
            this.updateResources(),
            this.plantGrow()
            const nextDayBuffer = this.toArrayBuffer();
            this.undoStack.push(nextDayBuffer);
            this.redoStack = [];
            saveToLocalStorage("autosave", this.undoStack, this.redoStack);
        });

        this.undoButton.setInteractive()
        .on("pointerdown", () => {  
            if (this.undoStack.length > 1) {
                const lastBuffer = this.undoStack.pop();
                if (lastBuffer) {
                    this.redoStack.push(lastBuffer);
                }
                this.fromArrayBuffer(this.undoStack[this.undoStack.length - 1]);
            }
        });

        this.redoButton.setInteractive()
        .on("pointerdown", () => {  
            if (this.redoStack.length > 0) {
                const nextBuffer = this.redoStack.pop();
                if (nextBuffer) {
                    this.undoStack.push(nextBuffer);
                }
                this.fromArrayBuffer(this.undoStack[this.undoStack.length - 1]);
            }
        });

        this.saveButton.setInteractive()
        .on("pointerdown", () => {
            this.scene.bringToTop("saveMenuScene");
            this.scene.pause();
            const currentState = this.makeSaveData();
            this.scene.launch("saveMenuScene", currentState);
        });

        this.loadButton.setInteractive()
        .on("pointerdown", () => {
            this.scene.bringToTop("loadMenuScene");
            this.scene.pause();
            const currentState = this.makeSaveData();
            this.scene.launch("loadMenuScene", currentState);
        });

        // show the win conditions
        this.add.text(this.width * 0.2, this.height - 40, `Goal: Earn $${this.winCondition}`, { fontSize: 36 });

        // sow plant board
        for (let x = 1; x < this.plant.length; x++){
            this.add.text(this.width / 1.45, 180 + (x-1) * 100, `sow ${this.plant[x].type} $${this.plant[x].cost}`, this.sowConfig)
            .setInteractive()
            .on("pointerdown", () => {  
                this.sowPlant(x); 
            });
            this.add.sprite(this.width / 1.35, 240 + (x-1) * 100, this.plant[x].type).setScale(1.3).setFrame(2)
        }

        this.add.text(this.width / 1.35, 530, "Reap", this.reapConfig).setInteractive()
        .on("pointerdown", () => {  
            this.reapPlant(); 
        });

        if (this.isSaveData(this.loadedSave)){
            this.setGameState(this.loadedSave);
        }
        this.updateResources();
        this.updatePlayerState();
        this.updateCellInfo()
        this.updateDayCountText(this.days);

        const firstBuffer = this.toArrayBuffer();
        this.undoStack.push(firstBuffer);

        saveToLocalStorage("autosave", this.undoStack, this.redoStack);
    }
    
    
    override update() {
        this.events.on("resume", (data: any) => {
            const newData = data;
            if (this.isSaveData(newData)) {
                this.setGameState(newData);
            }
        });
        this.player.updatePlayer();
        this.updatePlayerState(); 
        this.updateCellInfo();
        this.updateMoneyText(this.money);
        if (this.money >= this.winCondition){
            this.scene.start("winScene", {days: this.days});
        }
    }

    isSaveData(data: any): data is SaveData {
        return data.discriminator === "SaveData";
    }

    makeSaveData(): SaveData {
        const playerPosition: PlayerPosition = {
            positionX: this.player.positionX,
            positionY: this.player.positionY
        };
        const grid: Cell[] = this.grid.map((cell: CellData) => {
            return {
                sun: cell.sun,
                water: cell.water,
                plantType: cell.plantType,
                growthLevel: cell.growthLevel
            };
        });
        const gameState: GameState = {
            player: playerPosition,
            money: this.money,
            days: this.days,
            grid: grid
        };
        const newSave: SaveData = {
            discriminator: "SaveData",
            currentState: gameState,
            undoStack: this.undoStack,
            redoStack: this.redoStack,
            gridSize: this.grid.length
        };
        return newSave;
    }

    setGameState(data: SaveData) {
        const gameState = data.currentState;
        this.days = gameState.days;
        this.money = gameState.money;
        this.undoStack = data.undoStack;
        this.redoStack = data.redoStack;
        this.player.updatePosition(gameState.player.positionX, gameState.player.positionX);
        for (let i = 0; i < data.gridSize; i++) {
            const cell = this.grid[i];
            cell.sun = gameState.grid[i].sun;
            cell.water = gameState.grid[i].water;
            cell.plantType = gameState.grid[i].plantType;
            cell.growthLevel = gameState.grid[i].growthLevel;
            if (cell.hasPlant && cell.plantType === 0) {
                cell.hasPlant = false;
                cell.plantSprite.destroy();
                cell.plantSprite = null;
            }
            if (cell.plantType !== 0) {
                if (!cell.hasPlant) {
                    cell.hasPlant = true;
                    cell.plantSprite = this.add.sprite(
                        cell.rect.x,
                        cell.rect.y,
                        this.plant[cell.plantType].type
                    ).setScale(2);
                }
            }
            if (cell.hasPlant) {
                cell.plantSprite.setFrame(cell.growthLevel);
            }
            this.grid[i] = cell;
        }
    }

    reapPlant(){
        let plantCell: CellData;
        if (this.selectCell){
            plantCell = this.selectCell
        }else{
            plantCell = this.foundCell(this.player.positionX, this.player.positionY);
        }
        if (plantCell && plantCell.growthLevel >= this.plant[plantCell.plantType].maxGrowth){
            this.money += this.plant[plantCell.plantType].price;
            plantCell.hasPlant = false; 
            plantCell.plantType = 0; 
            plantCell.growthLevel = 0;
            if (plantCell.plantSprite){
                plantCell.plantSprite.destroy();
            }
            plantCell.plantSprite = null;

            const reapBuffer = this.toArrayBuffer();
            this.undoStack.push(reapBuffer);
            this.redoStack = [];
        }
    }

    setBorderVisble(){
        if (this.selectCell){
            this.selectCell.border.setVisible(false);
        }
        if (this.selectCell && this.checkIsNear(this.selectCell, this.foundCell(this.player.positionX, this.player.positionY))){
            this.selectCell.border.setVisible(true)
        }else{
            this.selectCell = null;
        }
    }

    checkCanGrow(cell: CellData){
        if (!cell.hasPlant || cell.growthLevel >= 2){
            return false
        }
        const plantIndex = this.plant.findIndex((plant: Plant) => plant.type === this.plant[cell.plantType].type);
        if (cell.sun >= this.plant[plantIndex].sunNeed && cell.water >= this.plant[plantIndex].waterNeed){
            return true
        }
        return false
    }

    plantGrow(){
        this.grid.forEach((cell: CellData) => {
            if (this.checkCanGrow(cell)){
                const plantIndex = this.plant.findIndex((plant: Plant) => plant.type === this.plant[cell.plantType].type);
                cell.growthLevel++
                cell.water -= this.plant[plantIndex].waterNeed;
                if (cell.plantSprite){
                    cell.plantSprite.setFrame(cell.growthLevel);
                }
            }
        });
    }

    sowPlant(plantIndex: number){
        let playerCell: CellData; 
        if (this.selectCell){
            playerCell = this.selectCell
        }else{
            playerCell = this.foundCell(this.player.positionX, this.player.positionY);
        }
        if (playerCell && !playerCell.hasPlant && this.money >= this.plant[plantIndex].cost){
            this.money -= this.plant[plantIndex].cost
            playerCell.hasPlant = true;
            playerCell.growthLevel = 0;
            playerCell.plantType = plantIndex
            playerCell.plantSprite = this.add.sprite(
                playerCell.rect.x,
                playerCell.rect.y,
                this.plant[plantIndex].type
            ).setScale(2)
            const sowBuffer = this.toArrayBuffer();
            this.undoStack.push(sowBuffer);
            this.redoStack = [];
        }else if (playerCell.hasPlant){
            console.log("This cell already has a plant")
        }
    }

    updateDayCountText(days: number) {
        this.dayCountText.setText(`Day: ${days}`);
    }

    updateMoneyText(money: number){
        this.playerMoney.setText(`Money: $${money}`);
    }

    updatePlayerState(){
        if (this.selectCell){
            this.displayPosition.setText(`Select Position: \n (${this.selectCell.row}, ${this.selectCell.col})`);
        }else{
            this.displayPosition.setText(`Select Position: \n (${this.player.positionX}, ${this.player.positionY})`);
        }
    }

    updateCellInfo(){
        if (this.selectCell){
            this.cellInfo.setText(`SunLevel: ${this.selectCell.sun}\nWaterLevel: ${this.selectCell.water}`);
        }else{
            const playerCell = this.foundCell(this.player.positionX, this.player.positionY);
            this.cellInfo.setText(`SunLevel: ${playerCell.sun}\nWaterLevel: ${playerCell.water}`);
        }
    }

    createGrid() {
        for (let row = 0; row < this.gridConfig.this.height; row ++) {
          for (let col = 0; col < this.gridConfig.width; col ++) {
            const cellX = row * this.gridConfig.size + this.gridConfig.size;
            const cellY = col * this.gridConfig.size + this.gridConfig.size;
            const cell = this.add.rectangle(
                cellX, 
                cellY, 
                this.gridConfig.size, 
                this.gridConfig.size, 
                this.landColor
                )
                .setStrokeStyle(3, 0xffffff);
            const border = this.add.rectangle(
                cellX, 
                cellY, 
                this.gridConfig.size, 
                this.gridConfig.size, 
                )
            .setStrokeStyle(3, 0x000000).setVisible(false).setDepth(3);
            
            this.grid.push({ // make good type defs for this, maybe nest things
                row, 
                col, 
                rect: cell,
                border: border, 
                sun: 0, 
                water: 0, 
                hasPlant: false, 
                plantType: 0, 
                growthLevel: 0,
                plantSprite: null
            });
            cell.setInteractive().on("pointerdown", () => {
                if (this.selectCell){
                    this.selectCell.border.setVisible(false);
                }
                this.selectCell = this.foundCell(row, col);
                if (this.checkIsNear(this.selectCell, this.foundCell(this.player.positionX, this.player.positionY))){
                    this.selectCell.border.setVisible(true)
                }else{
                    this.selectCell = null;
                }   
            });
          }
        }
    }

    // Check if two cell is near by
   checkIsNear(cellA: any, CellB: any){
    if (cellA.row === CellB.row && cellA.col === CellB.col){
        return true;
    }else{
        const differenceX = CellB.row - cellA.row;
        const differenceY = CellB.col - cellA.col;
        if (differenceX <= 1 && differenceX >= -1){
            if (differenceY <= 1 && differenceY >= -1){
                return true
            }
        }
        return false;
        }
    }

    updateResources(){
        this.grid.forEach((cell:any) => {
            cell.sun = Phaser.Math.Between(0, 5); 
            cell.water += Phaser.Math.Between(0, 3);
            if (cell.water >= 10){ 
                cell.water = 10;
            }
        });
    }

    foundCell(row: number, col: number) {
        return this.grid.find(
          (cell:any) => cell.row === row && cell.col === col
        );
    }

    toArrayBuffer() {
        const buffer = new ArrayBuffer(58);
        const view = new DataView(buffer);
        view.setInt16(0, this.player.positionX, true);
        view.setInt16(2, this.player.positionY, true);
        view.setInt16(4, this.money, true);
        view.setInt16(6, this.days, true);
        for (let i = 0; i < this.grid.length; i++) {
            const cell = this.grid[i];
            const cellValue = cell.water * 1000 + cell.sun * 100 + cell.plantType * 10 + cell.growthLevel;
            view.setInt16(8 + i * 2, cellValue, true);
        }
        return buffer;
    }

    fromArrayBuffer(buffer: ArrayBuffer) {
        const view = new DataView(buffer);
        const row = view.getInt16(0, true);
        const col = view.getInt16(2, true);
        this.player.updatePosition(row, col);
        this.money = view.getInt16(4, true);
        this.days = view.getInt16(6, true);
        for (let i = 0; i < this.grid.length; i++) {
            const cellValue = view.getInt16(8 + i * 2, true);
            const cell = this.grid[i];
            cell.water = Math.floor(cellValue / 1000);
            cell.sun = Math.floor(cellValue % 1000 / 100);
            cell.plantType = Math.floor(cellValue % 100 / 10);
            if (cell.hasPlant && cell.plantType === 0) {
                cell.hasPlant = false;
                cell.plantSprite.destroy();
                cell.plantSprite = null;
            }
            if (cell.plantType !== 0) {
                if (!cell.hasPlant) {
                    cell.hasPlant = true;
                    cell.plantSprite = this.add.sprite(
                        cell.rect.x,
                        cell.rect.y,
                        this.plant[cell.plantType].type
                    ).setScale(2);
                }
            }
            cell.growthLevel = Math.floor(cellValue % 10);
            if (cell.hasPlant) {
                cell.plantSprite.setFrame(cell.growthLevel);
            }
        }
    }
}
