// deno-lint-ignore-file
export class Player extends Phaser.Physics.Arcade.Sprite {
  positionX: number = 0;
  positionY: number = 0;
  gridConfig: any;
  keys: any;
  override scene: Phaser.Scene;
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: number, gridConfig: any, keyConfig: any) {
    super(scene, x, y, texture, frame);
    // Scale the player
    this.setScale(3);
    this.scene = scene;
    // Add the player to the scene
    scene.add.existing(this);

    // play idle
    this.anims.play("idle");

    // position of the player on grid
    this.positionX = x;
    this.positionY = y;

    // set player position
    this.updatePosition(0, 0);

    this.gridConfig = gridConfig;
    this.keys = keyConfig;
  }

  // function that change player position
  updatePosition(row: number, col: number) {
    this.x = this.gridConfig.size + this.gridConfig.size * row;
    this.y = this.gridConfig.size + this.gridConfig.size * col - 10;
    this.positionX = row;
    this.positionY = col
  }

  updatePlayer(){
    // make a local copy of the keyboard object
    const { left, right, up, down} = this.keys;
    if (!this.active)
	  {
		  return
	  }
    // move left
    if(Phaser.Input.Keyboard.JustDown(left) && this.positionX != 0) {
      this.updatePosition(this.positionX - 1, this.positionY)
    }
    // move right
    else if (Phaser.Input.Keyboard.JustDown(right) && this.positionX != this.gridConfig.width - 1){
      this.updatePosition(this.positionX + 1, this.positionY)
    }
    // move up
    else if (Phaser.Input.Keyboard.JustDown(up) && this.positionY != 0){
      this.updatePosition(this.positionX, this.positionY - 1)
    }
    // move down
    else if (Phaser.Input.Keyboard.JustDown(down) && this.positionY != this.gridConfig.height - 1){
      this.updatePosition(this.positionX, this.positionY + 1)
    }
  }
}

