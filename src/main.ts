// deno-lint-ignore-file
// debug with extreme prejudice
import Phaser from "phaser";
import jsyaml from "js-yaml";
import {Player} from "./prefabs/Player.ts";
import {Load} from "./scenes/Load.ts";
import {Title} from "./scenes/Title.ts";
import {ContinueMenu} from "./scenes/Saves.ts";
import {LoadMenu} from "./scenes/Saves.ts";
import {SaveMenu} from "./scenes/Saves.ts";
import {Credits} from "./scenes/Title.ts";
import {Play} from "./scenes/Play.ts";
import {Win} from "./scenes/Win.ts";
"use strict";

// game config
const config = {
  parent: "phaser-game", // for info text
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  backgroundColor: '#7ac769',
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: [Load, Title, ContinueMenu, LoadMenu, SaveMenu, Credits, Play, Win],
};

var cursors;
const SCALE = 2.0;
var my = { sprite: {}, text: {} };

const game = new Phaser.Game(config);
const { height, width } = game.config;
