// deno-lint-ignore-file
export class Win extends Phaser.Scene {
    days: number;
    constructor(data: any) {
        super("winScene")
        this.days = data.days;
    }

    create(){
        let textConfig = {
            fontSize: '36px',
            color: '#ffffff',
            align: 'right',
            padding: {
            top: 5,
            bottom: 5,
            },
            fixedWidth: 0
        }
        this.add.text(140, 200, 'Congratulations,  \nyou achieved the goal', textConfig)
        this.add.text(120, 300, `You reached the goal in ${this.days} days`, textConfig)
    }
}