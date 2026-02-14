import Phaser from 'phaser';
import { AGES } from './AgesConfig.js';
import { DIFFICULTIES } from './MenuScene.js';

const STORAGE_KEY = 'stickman_progress';

export const SONGS = [
  { id: 'bgMusic',    title: 'Default Theme',   file: 'music/bg-music.mp3', unlocksAfterAge: -1 },
  { id: 'spongebob',  title: 'SpongeBob Theme', file: 'music/SpongeBob SquarePants Theme Song (NEW HD)  Episode Opening Credits  Nick Animation.mp3', unlocksAfterAge: 0 },
  { id: 'whatIsLove', title: 'What Is Love',    file: 'music/Haddaway - What Is Love (Official 4K).mp3', unlocksAfterAge: 1 },
  { id: 'sweetVictory', title: 'Sweet Victory', file: 'music/Sweet Victory Performance  Band Geeks  SpongeBob.mp3', unlocksAfterAge: 2 },
];

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return { unlockedAge: 0, birdUnlocked: false, selectedSong: 'bgMusic' };
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export { loadProgress, saveProgress };

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  preload() {
    SONGS.forEach((song) => {
      if (!this.cache.audio.exists(song.id)) {
        this.load.audio(song.id, song.file);
      }
    });
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
    this.previewMusic = null;
    this.shopElements = [];

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
    const backBtn = this.add.rectangle(cx - 110, 520, 180, 44, 0x336699, 0.9)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx - 110, 520, 'Back to Menu', {
      fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    backBtn.on('pointerover', () => backBtn.setAlpha(1));
    backBtn.on('pointerout', () => backBtn.setAlpha(0.9));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    // Music button
    const musicBtn = this.add.rectangle(cx + 110, 520, 180, 44, 0x664499, 0.9)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx + 110, 520, 'Music', {
      fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    musicBtn.on('pointerover', () => musicBtn.setAlpha(1));
    musicBtn.on('pointerout', () => musicBtn.setAlpha(0.9));
    musicBtn.on('pointerdown', () => this.openMusicShop());
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
        this.stopPreview();
        this.scene.start('GameScene', { difficulty: key, ageIndex });
      });
    });
  }

  openMusicShop() {
    if (this.shopElements.length > 0) return; // already open

    const cx = 512;
    const cy = 288;
    const progress = loadProgress();
    const selectedSong = progress.selectedSong || 'bgMusic';

    // Backdrop
    const backdrop = this.add.rectangle(cx, cy, 1024, 576, 0x000000, 0.5)
      .setInteractive();
    backdrop.on('pointerdown', () => this.closeMusicShop());
    this.shopElements.push(backdrop);

    // Panel
    const panelW = 500;
    const panelH = 380;
    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0xffd700).setInteractive();
    this.shopElements.push(panel);

    // Title
    const title = this.add.text(cx, cy - panelH / 2 + 30, 'SONG SHOP', {
      fontSize: '28px', color: '#ffd700', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.shopElements.push(title);

    // Close button
    const closeBtn = this.add.text(cx + panelW / 2 - 20, cy - panelH / 2 + 12, 'X', {
      fontSize: '20px', color: '#ff4444', fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeMusicShop());
    this.shopElements.push(closeBtn);

    // Song rows
    const rowStartY = cy - panelH / 2 + 80;
    const rowH = 70;

    SONGS.forEach((song, i) => {
      const rowY = rowStartY + i * rowH;
      const isUnlocked = song.unlocksAfterAge < progress.unlockedAge;
      const isSelected = song.id === selectedSong;

      // Song title
      const titleColor = isUnlocked ? '#ffffff' : '#666666';
      const songTitle = this.add.text(cx - panelW / 2 + 30, rowY, song.title, {
        fontSize: '18px', color: titleColor, fontStyle: 'bold',
      }).setOrigin(0, 0.5);
      this.shopElements.push(songTitle);

      if (isUnlocked) {
        // Preview button
        const previewBtn = this.add.rectangle(cx + 80, rowY, 80, 32, 0x336699, 0.9)
          .setInteractive({ useHandCursor: true });
        this.shopElements.push(previewBtn);
        const previewLabel = this.add.text(cx + 80, rowY, 'Preview', {
          fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5);
        this.shopElements.push(previewLabel);
        previewBtn.on('pointerover', () => previewBtn.setAlpha(1));
        previewBtn.on('pointerout', () => previewBtn.setAlpha(0.9));
        previewBtn.on('pointerdown', () => {
          this.stopPreview();
          this.previewMusic = this.sound.add(song.id, { loop: true, volume: 0.5 });
          this.previewMusic.play();
        });

        if (isSelected) {
          // Selected indicator
          const selLabel = this.add.text(cx + 170, rowY, 'SELECTED', {
            fontSize: '13px', color: '#44ff44', fontStyle: 'bold',
          }).setOrigin(0.5);
          this.shopElements.push(selLabel);
        } else {
          // Select button
          const selectBtn = this.add.rectangle(cx + 170, rowY, 80, 32, 0x447744, 0.9)
            .setInteractive({ useHandCursor: true });
          this.shopElements.push(selectBtn);
          const selectLabel = this.add.text(cx + 170, rowY, 'Select', {
            fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
          }).setOrigin(0.5);
          this.shopElements.push(selectLabel);
          selectBtn.on('pointerover', () => selectBtn.setAlpha(1));
          selectBtn.on('pointerout', () => selectBtn.setAlpha(0.9));
          selectBtn.on('pointerdown', () => {
            const prog = loadProgress();
            prog.selectedSong = song.id;
            saveProgress(prog);
            this.closeMusicShop();
            this.openMusicShop();
          });
        }
      } else {
        // Locked label
        const ageName = AGES[song.unlocksAfterAge] ? AGES[song.unlocksAfterAge].name : 'an age';
        const lockLabel = this.add.text(cx + 130, rowY, `Beat ${ageName} to unlock`, {
          fontSize: '13px', color: '#666666',
        }).setOrigin(0.5);
        this.shopElements.push(lockLabel);
      }
    });
  }

  closeMusicShop() {
    this.stopPreview();
    this.shopElements.forEach((el) => el.destroy());
    this.shopElements = [];
  }

  stopPreview() {
    if (this.previewMusic) {
      this.previewMusic.stop();
      this.previewMusic.destroy();
      this.previewMusic = null;
    }
  }
}
