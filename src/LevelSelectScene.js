import Phaser from 'phaser';
import { AGES } from './AgesConfig.js';
import { DIFFICULTIES } from './MenuScene.js';

const STORAGE_KEY = 'stickman_progress';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return { unlockedAge: 0, birdUnlocked: false };
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export { loadProgress, saveProgress };

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create() {
    const cx = 512;
    const progress = loadProgress();
    const unlocked = progress.unlockedAge;

    // Title
    this.add.text(cx, 50, 'SELECT AGE', {
      fontSize: '36px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    // Age cards
    const cardW = 200;
    const cardH = 180;
    const gap = 20;
    const totalW = AGES.length * cardW + (AGES.length - 1) * gap;
    const startX = cx - totalW / 2;
    const cardY = 180;

    this.selectedAge = null;
    this.difficultyElements = [];
    this.ageCards = [];

    AGES.forEach((age, i) => {
      const x = startX + i * (cardW + gap) + cardW / 2;
      const isLocked = i > unlocked;

      // Card background
      const bgColor = isLocked ? 0x333333 : 0x222244;
      const card = this.add.rectangle(x, cardY, cardW, cardH, bgColor, 0.9)
        .setStrokeStyle(2, isLocked ? 0x555555 : 0xffd700);

      if (!isLocked) this.ageCards.push(card);

      // Age name
      this.add.text(x, cardY - 60, age.name, {
        fontSize: '18px', color: isLocked ? '#666666' : '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);

      // Description
      this.add.text(x, cardY - 30, age.description, {
        fontSize: '11px', color: isLocked ? '#555555' : '#aaaaaa',
        wordWrap: { width: cardW - 20 }, align: 'center',
      }).setOrigin(0.5);

      // Stats info
      const statColor = isLocked ? '#555555' : '#88aaff';
      this.add.text(x, cardY + 10, `Stat Scale: ${age.statMult}x`, {
        fontSize: '12px', color: statColor,
      }).setOrigin(0.5);
      this.add.text(x, cardY + 28, `Enemy Base: ${age.enemyBaseHP} HP`, {
        fontSize: '12px', color: statColor,
      }).setOrigin(0.5);

      if (isLocked) {
        // Lock indicator
        this.add.text(x, cardY + 58, '[LOCKED]', {
          fontSize: '16px', color: '#666666', fontStyle: 'bold',
        }).setOrigin(0.5);
      } else {
        // Selectable
        card.setInteractive({ useHandCursor: true });
        card.on('pointerover', () => card.setAlpha(1));
        card.on('pointerout', () => {
          if (this.selectedAge !== i) card.setAlpha(0.9);
        });
        card.on('pointerdown', () => {
          // Deselect previous card
          this.ageCards.forEach((c) => {
            c.setStrokeStyle(2, 0xffd700);
            c.setAlpha(0.9);
          });
          // Highlight selected card
          this.selectedAge = i;
          card.setStrokeStyle(3, 0x44ff44);
          card.setAlpha(1);
          this.showDifficultyButtons(i);
        });

        // "Select" hint
        this.add.text(x, cardY + 58, 'Click to Play', {
          fontSize: '13px', color: '#88ff88',
        }).setOrigin(0.5);
      }
    });

    // Bird unlock banner
    if (progress.birdUnlocked) {
      this.add.text(cx, cardY + cardH / 2 + 20, 'Bird Unit Unlocked!', {
        fontSize: '18px', color: '#ffd700', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5);
    }

    // Difficulty section (populated on age click)
    this.difficultyY = 320;

    // Back to Menu button
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
    // Clear previous difficulty buttons
    this.difficultyElements.forEach((el) => el.destroy());
    this.difficultyElements = [];

    const cx = 512;
    const y = this.difficultyY;

    const header = this.add.text(cx, y, `Choose Difficulty for ${AGES[ageIndex].name}`, {
      fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.difficultyElements.push(header);

    const keys = Object.keys(DIFFICULTIES);
    const btnW = 180;
    const btnH = 50;
    const gap = 16;
    const totalW = keys.length * btnW + (keys.length - 1) * gap;
    const startX = cx - totalW / 2;
    const btnY = y + 50;

    const descriptions = [
      'More gold, weaker enemies',
      'Balanced experience',
      'Less gold, tougher enemies',
      'Brutal challenge!',
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
        this.scene.start('GameScene', { difficulty: key, ageIndex });
      });
    });
  }
}
