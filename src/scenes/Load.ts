// deno-lint-ignore-file
export class Load extends Phaser.Scene {
  constructor() {
    super("loadScene");
  }

  preload() {
    // Load external DSL
    this.load.text("gameConfig", "./config/scenario.yaml")
    // load the visual goodz
    this.load.path = "./assets/";
    this.load.image("titlePage", "Title.png");
    this.load.image("buttonGraphic", "red.png");
    this.load.spritesheet("player", "mystic_woods_free/sprites/characters/player.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("mushroom", "Tiny Swords (Update 010)/spritesheet.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("stone", "Tiny Swords (Update 010)/spritesheet (1).png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("grass", "Tiny Swords (Update 010)/spritesheet (2).png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("pumpkin", "Tiny Swords (Update 010)/spritesheet (3).png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    this.anims.create({
      key: "idle",
      frameRate: 8,
      repeat: -1,
      frames: this.anims.generateFrameNumbers("player", { start: 6, end: 11 }),
    });

    // proceed once loading completes
    this.scene.start("titleScene");
  }
}
