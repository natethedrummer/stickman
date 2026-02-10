import Phaser from 'phaser';
import { MenuScene } from './MenuScene.js';
import { TutorialScene } from './TutorialScene.js';
import { GameScene } from './GameScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 576,
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false,
    },
  },
  scene: [MenuScene, TutorialScene, GameScene],
};

new Phaser.Game(config);
