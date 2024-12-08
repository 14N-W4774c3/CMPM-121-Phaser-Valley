export class Title extends Phaser.Scene {
    buttonPressed: boolean = false;
    buttonPlay: Phaser.GameObjects.Sprite = this.add.sprite(200, 510, "buttonGraphic").setScale(1.75, 1);;
    buttonCredits: Phaser.GameObjects.Sprite = this.add.sprite(600, 510, "buttonGraphic").setScale(1.75, 1);

    constructor() {
      super("titleScene");
    }
    create (){
        this.add.image(400, 300, "titlePage");
        this.add.text(325, 200, "Phaser Valley", {
            fontFamily: 'Arial', 
            fontSize: '24px', 
        });
        this.buttonPlay.setInteractive();
        this.buttonCredits.setInteractive();
        // Button Text
        this.add.text(180, 500, "Play");
        this.add.text(570, 500, "Credits");
    }
    override update (){
        // Button Handlers
        this.buttonPlay.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            this.scene.start("continueMenuScene");
        });
        this.buttonCredits.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            this.scene.start("creditsScene");
        });
    }
}

export class Credits extends Phaser.Scene {
    buttonPressed: boolean = false;
    config = {
        fontFamily: 'Arial',
        align: 'center',
    }
    buttonReturn: Phaser.GameObjects.Sprite = this.add.sprite(380, 560, "buttonGraphic").setScale(1.75, 1);
    constructor() {
      super("creditsScene");
    }
    create () {
        this.add.text(360, 100, "Credits", {
            fontFamily: 'Arial', 
            fontSize: '24px', 
            align: 'center',
        });
        // Credits Text
        this.add.text(50, 200, "Core Programming by Haorong Rong", this.config);
        this.add.text(50, 250, "Save System by Ian Wallace", this.config);
        this.add.text(50, 300, "Title graphic made with assets from Kenney Assets", this.config);
        this.add.text(50, 350, "Terrain and Character sprites from Mystic Woods pack by Game Endeavor:\n https://game-endeavor.itch.io/mystic-woods", this.config);
        this.add.text(50, 400, "Plant Sprites from Tiny Swords pack by Pixel Frog:\n https://pixelfrog-assets.itch.io/tiny-swords", this.config);
        this.buttonReturn.setInteractive();
        this.add.text(355, 550, "Return", this.config);
    }
    override update (){
        this.buttonReturn.on('pointerdown', () => {
            if (this.buttonPressed) return;
            this.buttonPressed = true;
            this.scene.start("titleScene");
        });
    }

}