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
    this.add.text(cx, 120, 'STICKMAN WARS', {
      fontSize: '52px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, 180, 'Select Difficulty', {
      fontSize: '22px', color: '#cccccc',
    }).setOrigin(0.5);

    // Difficulty buttons
    const keys = Object.keys(DIFFICULTIES);
    const btnW = 180;
    const btnH = 50;
    const gap = 16;
    const totalW = keys.length * btnW + (keys.length - 1) * gap;
    const startX = cx - totalW / 2;
    const btnY = 280;

    keys.forEach((key, i) => {
      const diff = DIFFICULTIES[key];
      const x = startX + i * (btnW + gap) + btnW / 2;

      const btn = this.add.rectangle(x, btnY, btnW, btnH, diff.color, 0.85)
        .setInteractive({ useHandCursor: true });

      this.add.text(x, btnY, diff.label, {
        fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);

      btn.on('pointerover', () => btn.setAlpha(1));
      btn.on('pointerout', () => btn.setAlpha(0.85));

      btn.on('pointerdown', () => {
        this.scene.start('GameScene', { difficulty: key });
      });
    });

    // Description text for each difficulty
    const descY = 340;
    const descriptions = [
      'More gold, weaker enemies',
      'Balanced experience',
      'Less gold, tougher enemies',
      'Brutal challenge!',
    ];
    keys.forEach((key, i) => {
      const diff = DIFFICULTIES[key];
      const x = startX + i * (btnW + gap) + btnW / 2;
      this.add.text(x, descY, descriptions[i], {
        fontSize: '12px', color: '#aaaaaa',
      }).setOrigin(0.5);
    });

    // Footer
    this.add.text(cx, 480, 'Arrow keys or on-screen buttons to scroll the battlefield', {
      fontSize: '14px', color: '#888888',
    }).setOrigin(0.5);
  }
}
