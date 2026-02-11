import Phaser from 'phaser';

const DIFFICULTIES = {
  easy:   { label: 'Easy',   startGold: 150, playerGoldPerSec: 8,  enemyGoldPerSec: 3,  enemySpawnInterval: 7000, enemyHpMult: 0.8, enemyDmgMult: 0.8, color: 0x33cc33 },
  medium: { label: 'Medium', startGold: 100, playerGoldPerSec: 5,  enemyGoldPerSec: 5,  enemySpawnInterval: 5000, enemyHpMult: 1.0, enemyDmgMult: 1.0, color: 0xffaa00 },
  hard:   { label: 'Hard',   startGold: 75,  playerGoldPerSec: 4,  enemyGoldPerSec: 7,  enemySpawnInterval: 3500, enemyHpMult: 1.2, enemyDmgMult: 1.2, color: 0xff4444 },
  crazy:  { label: 'Crazy',  startGold: 50,  playerGoldPerSec: 3,  enemyGoldPerSec: 10, enemySpawnInterval: 2000, enemyHpMult: 1.5, enemyDmgMult: 1.5, color: 0xcc00ff },
};

export { DIFFICULTIES };

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const cx = 512;

    // Title
    this.add.text(cx, 140, 'STICKMAN WARS', {
      fontSize: '52px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, 200, 'Battle through the ages!', {
      fontSize: '20px', color: '#cccccc',
    }).setOrigin(0.5);

    // Play button
    const playBtn = this.add.rectangle(cx, 300, 220, 60, 0x228822, 0.9)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, 300, 'PLAY', {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);
    playBtn.on('pointerover', () => playBtn.setAlpha(1));
    playBtn.on('pointerout', () => playBtn.setAlpha(0.9));
    playBtn.on('pointerdown', () => this.scene.start('LevelSelectScene'));

    // How to Play button
    const tutBtn = this.add.rectangle(cx, 380, 180, 44, 0x336699, 0.9)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, 380, 'How to Play', {
      fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    tutBtn.on('pointerover', () => tutBtn.setAlpha(1));
    tutBtn.on('pointerout', () => tutBtn.setAlpha(0.9));
    tutBtn.on('pointerdown', () => this.scene.start('TutorialScene'));

    // Footer
    this.add.text(cx, 480, 'Arrow keys or on-screen buttons to scroll the battlefield', {
      fontSize: '14px', color: '#888888',
    }).setOrigin(0.5);
  }
}
