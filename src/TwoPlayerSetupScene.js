import Phaser from 'phaser';
import { AGES } from './AgesConfig.js';
import { DIFFICULTIES } from './MenuScene.js';

export class TwoPlayerSetupScene extends Phaser.Scene {
  constructor() {
    super('TwoPlayerSetupScene');
  }

  create() {
    const cx = 512;

    // Title
    this.add.text(cx, 50, '2 PLAYER - SELECT AGE', {
      fontSize: '36px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, 90, 'All ages unlocked for local play', {
      fontSize: '14px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // Age cards — 2-row layout for 7 ages
    const cardW = 180;
    const cardH = 130;
    const gap = 14;
    const row1Count = 4;
    const row1Y = 150;
    const row2Y = 300;

    this.selectedAge = null;
    this.difficultyElements = [];
    this.ageCards = [];

    AGES.forEach((age, i) => {
      const row = i < row1Count ? 0 : 1;
      const colCount = row === 0 ? row1Count : AGES.length - row1Count;
      const col = row === 0 ? i : i - row1Count;
      const totalW = colCount * cardW + (colCount - 1) * gap;
      const startX = cx - totalW / 2;
      const x = startX + col * (cardW + gap) + cardW / 2;
      const cardY = row === 0 ? row1Y : row2Y;

      const card = this.add.rectangle(x, cardY, cardW, cardH, 0x222244, 0.9)
        .setStrokeStyle(2, 0xffd700);
      this.ageCards.push(card);

      // Age name
      this.add.text(x, cardY - 42, age.name, {
        fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);

      // Description
      this.add.text(x, cardY - 18, age.description, {
        fontSize: '10px', color: '#aaaaaa',
        wordWrap: { width: cardW - 16 }, align: 'center',
      }).setOrigin(0.5);

      // Stats
      this.add.text(x, cardY + 10, `Stat Scale: ${age.statMult}x`, {
        fontSize: '11px', color: '#88aaff',
      }).setOrigin(0.5);

      // Selectable
      card.setInteractive({ useHandCursor: true });
      card.on('pointerover', () => card.setAlpha(1));
      card.on('pointerout', () => {
        if (this.selectedAge !== i) card.setAlpha(0.9);
      });
      card.on('pointerdown', () => {
        this.ageCards.forEach((c) => {
          c.setStrokeStyle(2, 0xffd700);
          c.setAlpha(0.9);
        });
        this.selectedAge = i;
        card.setStrokeStyle(3, 0x44ff44);
        card.setAlpha(1);
        this.showDifficultyButtons(i);
      });

      this.add.text(x, cardY + 40, 'Click to Play', {
        fontSize: '12px', color: '#88ff88',
      }).setOrigin(0.5);
    });

    // Difficulty section
    this.difficultyY = 400;

    // Back button
    const backBtn = this.add.rectangle(cx, 520, 180, 44, 0x336699, 0.9)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, 520, 'Back to Menu', {
      fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    backBtn.on('pointerover', () => backBtn.setAlpha(1));
    backBtn.on('pointerout', () => backBtn.setAlpha(0.9));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  showDifficultyButtons(ageIndex) {
    this.difficultyElements.forEach((el) => el.destroy());
    this.difficultyElements = [];

    const cx = 512;
    const y = this.difficultyY;

    const header = this.add.text(cx, y, `Choose Difficulty for ${AGES[ageIndex].name}`, {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.difficultyElements.push(header);

    const subheader = this.add.text(cx, y + 20, 'Both players get equal stats in 2P mode', {
      fontSize: '11px', color: '#aaaaaa',
    }).setOrigin(0.5);
    this.difficultyElements.push(subheader);

    const keys = Object.keys(DIFFICULTIES);
    const btnW = 170;
    const btnH = 40;
    const gap = 14;
    const totalW = keys.length * btnW + (keys.length - 1) * gap;
    const startX = cx - totalW / 2;
    const btnY = y + 52;

    const descriptions = [
      'More starting gold',
      'Balanced start',
      'Less starting gold',
      'Minimal starting gold',
    ];

    keys.forEach((key, i) => {
      const diff = DIFFICULTIES[key];
      const x = startX + i * (btnW + gap) + btnW / 2;

      const btn = this.add.rectangle(x, btnY, btnW, btnH, diff.color, 0.85)
        .setInteractive({ useHandCursor: true });
      this.difficultyElements.push(btn);

      const label = this.add.text(x, btnY, diff.label, {
        fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);
      this.difficultyElements.push(label);

      const desc = this.add.text(x, btnY + 28, descriptions[i], {
        fontSize: '11px', color: '#aaaaaa',
      }).setOrigin(0.5);
      this.difficultyElements.push(desc);

      btn.on('pointerover', () => btn.setAlpha(1));
      btn.on('pointerout', () => btn.setAlpha(0.85));
      btn.on('pointerdown', () => {
        this.scene.start('GameScene', { twoPlayer: true, ageIndex, difficulty: key });
      });
    });
  }
}
