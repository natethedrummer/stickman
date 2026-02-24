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

    // Age cards
    const cardW = 200;
    const cardH = 160;
    const gap = 20;
    const totalW = AGES.length * cardW + (AGES.length - 1) * gap;
    const startX = cx - totalW / 2;
    const cardY = 190;

    this.selectedAge = null;
    this.difficultyElements = [];
    this.ageCards = [];

    AGES.forEach((age, i) => {
      const x = startX + i * (cardW + gap) + cardW / 2;

      const card = this.add.rectangle(x, cardY, cardW, cardH, 0x222244, 0.9)
        .setStrokeStyle(2, 0xffd700);
      this.ageCards.push(card);

      // Age name
      this.add.text(x, cardY - 50, age.name, {
        fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);

      // Description
      this.add.text(x, cardY - 20, age.description, {
        fontSize: '11px', color: '#aaaaaa',
        wordWrap: { width: cardW - 20 }, align: 'center',
      }).setOrigin(0.5);

      // Stats
      this.add.text(x, cardY + 15, `Stat Scale: ${age.statMult}x`, {
        fontSize: '12px', color: '#88aaff',
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

      this.add.text(x, cardY + 50, 'Click to Play', {
        fontSize: '13px', color: '#88ff88',
      }).setOrigin(0.5);
    });

    // Difficulty section
    this.difficultyY = 320;

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
      fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.difficultyElements.push(header);

    const subheader = this.add.text(cx, y + 25, 'Both players get equal stats in 2P mode', {
      fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5);
    this.difficultyElements.push(subheader);

    const keys = Object.keys(DIFFICULTIES);
    const btnW = 180;
    const btnH = 50;
    const gap = 16;
    const totalW = keys.length * btnW + (keys.length - 1) * gap;
    const startX = cx - totalW / 2;
    const btnY = y + 70;

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
        fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);
      this.difficultyElements.push(label);

      const desc = this.add.text(x, btnY + 35, descriptions[i], {
        fontSize: '12px', color: '#aaaaaa',
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
