import Phaser from 'phaser';
import { SoundFX } from './SoundFX.js';
import { DIFFICULTIES } from './MenuScene.js';

const GROUND_Y = 500;
const GAME_W = 3072;

const UNIT_TYPES = [
  { name: 'Archer',   cost: 25,  hp: 25,  damage: 15, speed: 50, width: 16, height: 32, color: 0x33cc33 },
  { name: 'Warrior',  cost: 50,  hp: 50,  damage: 10, speed: 50, width: 24, height: 40, color: 0x3399ff },
  { name: 'Spearman', cost: 75,  hp: 65,  damage: 12, speed: 60, width: 20, height: 44, color: 0xff8800 },
  { name: 'Giant',    cost: 150, hp: 150, damage: 20, speed: 30, width: 36, height: 52, color: 0x9933ff },
];

const ABILITIES = [
  { id: 'rainOfArrows', name: 'Rain of Arrows', cost: 100, description: '30 dmg to all enemies', type: 'instant', cooldown: 15, color: 0xff4444 },
  { id: 'healBase',     name: 'Heal Base',      cost: 75,  description: 'Restore 100 HP to base', type: 'instant', cooldown: 20, color: 0x44ff44 },
  { id: 'warDrums',     name: 'War Drums',      cost: 100, description: '+20% unit speed',        type: 'passive', cooldown: 0,  color: 0xff8800 },
  { id: 'goldMine',     name: 'Gold Mine',       cost: 150, description: '2x gold income',        type: 'passive', cooldown: 0,  color: 0xffd700 },
];

const textureKey = (typeName, faction, pose = 'idle') => `${typeName.toLowerCase()}_${faction}_${pose}`;
const animKey = (typeName, faction, state) => `${typeName.toLowerCase()}_${faction}_${state}`;

const BASE_HP = 500;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.audio('bgMusic', 'music/bg-music.mp3');
  }

  create(data) {
    const diffKey = (data && data.difficulty) || 'medium';
    this.difficulty = DIFFICULTIES[diffKey] || DIFFICULTIES.medium;

    this.generateStickmanTextures();
    this.drawBackground();

    // ── Ground ──────────────────────────────────────────────
    const ground = this.add.rectangle(GAME_W / 2, GROUND_Y + 40, GAME_W, 80, 0x3d8b37).setDepth(5);
    this.physics.add.existing(ground, true); // static body
    this.ground = ground;

    // ── Bases ───────────────────────────────────────────────
    this.playerBaseHP = BASE_HP;
    this.enemyBaseHP = BASE_HP;

    // Player base (left)
    this.playerBase = this.add.rectangle(60, GROUND_Y - 60, 80, 120, 0x4444cc).setDepth(10);
    this.playerBase.faction = 'player';
    this.playerBase.unitHeight = 120;
    this.physics.add.existing(this.playerBase, true);
    this.playerBaseLabel = this.add.text(20, GROUND_Y - 140, 'Your Base', {
      fontSize: '13px', color: '#ffffff',
    }).setDepth(10);
    this.playerHPText = this.add.text(20, GROUND_Y - 125, `HP: ${this.playerBaseHP}`, {
      fontSize: '12px', color: '#ffffff',
    }).setDepth(10);

    // Enemy base (right)
    this.enemyBase = this.add.rectangle(GAME_W - 60, GROUND_Y - 60, 80, 120, 0xcc4444).setDepth(10);
    this.enemyBase.faction = 'enemy';
    this.enemyBase.unitHeight = 120;
    this.physics.add.existing(this.enemyBase, true);
    this.enemyBaseLabel = this.add.text(GAME_W - 110, GROUND_Y - 140, 'Enemy Base', {
      fontSize: '13px', color: '#ffffff',
    }).setDepth(10);
    this.enemyHPText = this.add.text(GAME_W - 110, GROUND_Y - 125, `HP: ${this.enemyBaseHP}`, {
      fontSize: '12px', color: '#ffffff',
    }).setDepth(10);

    // ── Gold ────────────────────────────────────────────────
    this.gold = this.difficulty.startGold;
    this.enemyGold = this.difficulty.startGold;
    this.goldText = this.add.text(16, 16, '', { fontSize: '20px', color: '#FFD700' }).setDepth(20);
    this.updateGoldText();

    // passive gold income
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.gold += this.difficulty.playerGoldPerSec * this.goldIncomeMultiplier;
        this.enemyGold += this.difficulty.enemyGoldPerSec;
        this.updateGoldText();
      },
    });

    // ── Spawn buttons ─────────────────────────────────────────
    const btnStartX = 130;
    const btnW = 160;
    const btnGap = 8;
    UNIT_TYPES.forEach((type, i) => {
      const x = btnStartX + i * (btnW + btnGap);
      const btn = this.add.rectangle(x, 20, btnW, 36, 0x226622, 0.9).setOrigin(0, 0).setScrollFactor(0).setDepth(20);
      const label = this.add.text(x + 8, 26, `${type.name} (${type.cost}g)`, {
        fontSize: '14px', color: '#ffffff',
      }).setScrollFactor(0).setDepth(20);
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => this.spawnUnit(type));
    });

    // ── Groups ──────────────────────────────────────────────
    this.warriors = this.physics.add.group();
    this.enemies = this.physics.add.group();

    // ── Collisions ──────────────────────────────────────────
    // Units land on ground
    this.physics.add.collider(this.warriors, this.ground);
    this.physics.add.collider(this.enemies, this.ground);

    // Warriors vs enemies — they stop and fight
    this.physics.add.overlap(this.warriors, this.enemies, this.unitFight, null, this);

    // ── Enemy spawner ───────────────────────────────────────
    this.time.addEvent({
      delay: this.difficulty.enemySpawnInterval,
      loop: true,
      callback: () => this.spawnEnemy(),
    });

    // ── Camera & physics bounds ─────────────────────────────
    this.physics.world.setBounds(0, 0, GAME_W, 576);
    this.cameras.main.setBounds(0, 0, GAME_W, 576);
    this.cursors = this.input.keyboard.createCursorKeys();

    // ── Pin HUD to camera ─────────────────────────────────
    this.goldText.setScrollFactor(0);

    // ── Background music ─────────────────────────────────────
    this.music = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
    this.music.play();

    // ── Mute toggle button (top-right, pinned to camera) ────
    this.muteBtn = this.add.text(1024 - 40, 16, '♪', {
      fontSize: '24px', color: '#ffffff',
    }).setScrollFactor(0).setInteractive({ useHandCursor: true }).setDepth(20);
    this.muteBtn.on('pointerdown', () => {
      this.sound.mute = !this.sound.mute;
      this.muteBtn.setText(this.sound.mute ? '♪X' : '♪');
    });

    // ── Shop button (top-right, left of mute) ─────────────────
    const shopBtnBg = this.add.rectangle(1024 - 100, 28, 50, 28, 0x886600, 0.9)
      .setScrollFactor(0).setDepth(20).setInteractive({ useHandCursor: true });
    this.add.text(1024 - 100, 28, 'Shop', {
      fontSize: '14px', color: '#FFD700', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    shopBtnBg.on('pointerdown', () => this.toggleShop());

    // ── Difficulty label (HUD) ────────────────────────────────
    this.add.text(1024 - 80, 48, this.difficulty.label, {
      fontSize: '14px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(20).setOrigin(0.5, 0);

    // ── Sound effects ─────────────────────────────────────────
    this.sfx = new SoundFX(() => this.sound.mute);
    this.lastCombatHitTime = 0;
    this.lastBaseDamageTime = 0;

    // ── Mobile camera buttons ─────────────────────────────────
    this.camLeft = false;
    this.camRight = false;

    const arrowBtnSize = 56;
    const arrowY = 576 - arrowBtnSize / 2 - 60;
    const arrowLeftX = arrowBtnSize / 2 + 12;
    const arrowRightX = arrowLeftX + arrowBtnSize + 10;

    const leftBtn = this.add.rectangle(arrowLeftX, arrowY, arrowBtnSize, arrowBtnSize, 0x000000, 0.4)
      .setScrollFactor(0).setDepth(20).setInteractive({ useHandCursor: true });
    this.add.text(arrowLeftX, arrowY, '◀', { fontSize: '28px', color: '#ffffff' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(21);

    const rightBtn = this.add.rectangle(arrowRightX, arrowY, arrowBtnSize, arrowBtnSize, 0x000000, 0.4)
      .setScrollFactor(0).setDepth(20).setInteractive({ useHandCursor: true });
    this.add.text(arrowRightX, arrowY, '▶', { fontSize: '28px', color: '#ffffff' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(21);

    leftBtn.on('pointerdown', () => { this.camLeft = true; });
    leftBtn.on('pointerup', () => { this.camLeft = false; });
    leftBtn.on('pointerout', () => { this.camLeft = false; });

    rightBtn.on('pointerdown', () => { this.camRight = true; });
    rightBtn.on('pointerup', () => { this.camRight = false; });
    rightBtn.on('pointerout', () => { this.camRight = false; });

    // ── Minimap ──────────────────────────────────────────────
    const mmW = 180;
    const mmH = 24;
    const mmX = 1024 - mmW - 12;
    const mmY = 576 - mmH - 12;
    this.minimapBg = this.add.rectangle(mmX + mmW / 2, mmY + mmH / 2, mmW, mmH, 0x000000, 0.5)
      .setScrollFactor(0).setDepth(20);
    // Viewport indicator
    const vpW = (1024 / GAME_W) * mmW;
    this.minimapVP = this.add.rectangle(mmX + vpW / 2, mmY + mmH / 2, vpW, mmH - 2, 0xffffff, 0.3)
      .setScrollFactor(0).setDepth(21);
    // Base markers
    const basePlayerX = mmX + (60 / GAME_W) * mmW;
    const baseEnemyX = mmX + ((GAME_W - 60) / GAME_W) * mmW;
    this.add.rectangle(basePlayerX, mmY + mmH / 2, 4, mmH - 4, 0x4444cc)
      .setScrollFactor(0).setDepth(22);
    this.add.rectangle(baseEnemyX, mmY + mmH / 2, 4, mmH - 4, 0xcc4444)
      .setScrollFactor(0).setDepth(22);
    // Graphics layer for unit dots
    this.minimapGfx = this.add.graphics().setScrollFactor(0).setDepth(22);
    this.minimapPos = { x: mmX, y: mmY, w: mmW, h: mmH };

    // ── Game-over flag ──────────────────────────────────────
    this.gameOver = false;

    // ── Shop state ────────────────────────────────────────────
    this.purchasedPassives = new Set();
    this.abilityCooldowns = {};
    this.speedMultiplier = 1;
    this.goldIncomeMultiplier = 1;
    this.shopOpen = false;
    this.shopElements = [];
    this.shopCooldownTimer = null;
    this.activeBuffsText = null;
  }

  // ── Texture generation ─────────────────────────────────────
  generateStickmanTextures() {
    const drawFns = {
      Archer: this.drawArcher,
      Warrior: this.drawWarrior,
      Spearman: this.drawSpearman,
      Giant: this.drawGiant,
    };

    const poses = ['idle', 'walk_0', 'walk_1', 'attack_0', 'attack_1'];

    UNIT_TYPES.forEach((type) => {
      const texW = type.width + 16;
      const texH = type.height + 4;

      [
        { faction: 'player', color: type.color },
        { faction: 'enemy', color: 0xff4444 },
      ].forEach(({ faction, color }) => {
        const drawFn = drawFns[type.name];
        if (!drawFn) return;
        poses.forEach((pose) => {
          const g = this.add.graphics();
          drawFn(g, texW, texH, color, pose);
          g.generateTexture(textureKey(type.name, faction, pose), texW, texH);
          g.destroy();
        });
      });
    });

    this.createAnimations();
  }

  createAnimations() {
    UNIT_TYPES.forEach((type) => {
      ['player', 'enemy'].forEach((faction) => {
        // Walk animation — 2 frames at 4 fps
        this.anims.create({
          key: animKey(type.name, faction, 'walk'),
          frames: [
            { key: textureKey(type.name, faction, 'walk_0') },
            { key: textureKey(type.name, faction, 'walk_1') },
          ],
          frameRate: 4,
          repeat: -1,
        });

        // Attack animation — 2 frames at 3 fps
        this.anims.create({
          key: animKey(type.name, faction, 'attack'),
          frames: [
            { key: textureKey(type.name, faction, 'attack_0') },
            { key: textureKey(type.name, faction, 'attack_1') },
          ],
          frameRate: 3,
          repeat: -1,
        });
      });
    });
  }

  // ── Parallax background ───────────────────────────────────
  drawBackground() {
    const viewW = 1024;
    const viewH = 576;

    // Layer 1 — Sky gradient (scrollFactor 0, fixed)
    const skyG = this.add.graphics();
    const bands = 32;
    const bandH = GROUND_Y / bands;
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      // Lerp from light blue (top) to pale white-blue (horizon)
      const r = Math.round(135 + (230 - 135) * t);
      const g = Math.round(206 + (240 - 206) * t);
      const b = Math.round(235 + (255 - 235) * t);
      const color = (r << 16) | (g << 8) | b;
      skyG.fillStyle(color, 1);
      skyG.fillRect(0, i * bandH, viewW, bandH + 1);
    }
    skyG.generateTexture('bg_sky', viewW, GROUND_Y);
    skyG.destroy();
    this.add.image(viewW / 2, GROUND_Y / 2, 'bg_sky').setScrollFactor(0).setDepth(0);

    // Layer 2 — Clouds (scrollFactor 0.1)
    const cloudW = Math.ceil(viewW + (GAME_W - viewW) * 0.1);
    const cloudG = this.add.graphics();
    const clouds = [
      { x: 120, y: 60, s: 1.0 },
      { x: 350, y: 90, s: 0.7 },
      { x: 550, y: 45, s: 1.2 },
      { x: 780, y: 75, s: 0.8 },
      { x: 950, y: 55, s: 1.1 },
      { x: 200, y: 110, s: 0.6 },
    ];
    clouds.forEach((c) => {
      cloudG.fillStyle(0xffffff, 0.6);
      cloudG.fillCircle(c.x, c.y, 24 * c.s);
      cloudG.fillCircle(c.x + 20 * c.s, c.y - 5, 20 * c.s);
      cloudG.fillCircle(c.x - 18 * c.s, c.y + 2, 18 * c.s);
      cloudG.fillCircle(c.x + 10 * c.s, c.y + 8, 16 * c.s);
      cloudG.fillStyle(0xeeeeee, 0.4);
      cloudG.fillCircle(c.x + 30 * c.s, c.y + 4, 14 * c.s);
      cloudG.fillCircle(c.x - 28 * c.s, c.y + 6, 12 * c.s);
    });
    cloudG.generateTexture('bg_clouds', cloudW, 150);
    cloudG.destroy();
    this.add.image(cloudW / 2, 75, 'bg_clouds').setScrollFactor(0.1).setDepth(1);

    // Layer 3 — Far mountains (scrollFactor 0.2, blue-grey)
    const farMtnW = Math.ceil(viewW + (GAME_W - viewW) * 0.2);
    const farG = this.add.graphics();
    farG.fillStyle(0x7090aa, 1);
    const farPeaks = [
      [0, GROUND_Y, 100, GROUND_Y - 160, 250, GROUND_Y],
      [200, GROUND_Y, 350, GROUND_Y - 200, 520, GROUND_Y],
      [450, GROUND_Y, 580, GROUND_Y - 140, 700, GROUND_Y],
      [640, GROUND_Y, 800, GROUND_Y - 180, 950, GROUND_Y],
      [880, GROUND_Y, 1020, GROUND_Y - 150, 1150, GROUND_Y],
      [1080, GROUND_Y, 1200, GROUND_Y - 170, 1350, GROUND_Y],
      [1280, GROUND_Y, 1380, GROUND_Y - 130, 1440, GROUND_Y],
    ];
    farPeaks.forEach(([x1, y1, x2, y2, x3, y3]) => {
      farG.fillTriangle(x1, y1, x2, y2, x3, y3);
    });
    // Snow caps on taller peaks
    farG.fillStyle(0xddeeff, 0.7);
    farPeaks.forEach(([x1, y1, x2, y2, x3, y3]) => {
      const peakH = y1 - y2;
      if (peakH > 150) {
        const capH = 25;
        const capW = capH * ((x3 - x1) / (2 * peakH));
        farG.fillTriangle(x2 - capW, y2 + capH, x2, y2, x2 + capW, y2 + capH);
      }
    });
    farG.generateTexture('bg_far_mtn', farMtnW, GROUND_Y);
    farG.destroy();
    this.add.image(farMtnW / 2, GROUND_Y / 2, 'bg_far_mtn').setScrollFactor(0.2).setDepth(2);

    // Layer 4 — Near mountains (scrollFactor 0.4, darker)
    const nearMtnW = Math.ceil(viewW + (GAME_W - viewW) * 0.4);
    const nearG = this.add.graphics();
    nearG.fillStyle(0x506848, 1);
    const nearPeaks = [
      [0, GROUND_Y, 80, GROUND_Y - 100, 200, GROUND_Y],
      [150, GROUND_Y, 300, GROUND_Y - 130, 430, GROUND_Y],
      [380, GROUND_Y, 500, GROUND_Y - 90, 600, GROUND_Y],
      [540, GROUND_Y, 680, GROUND_Y - 120, 820, GROUND_Y],
      [760, GROUND_Y, 900, GROUND_Y - 110, 1020, GROUND_Y],
      [960, GROUND_Y, 1100, GROUND_Y - 140, 1250, GROUND_Y],
      [1180, GROUND_Y, 1320, GROUND_Y - 95, 1440, GROUND_Y],
      [1380, GROUND_Y, 1500, GROUND_Y - 115, 1620, GROUND_Y],
      [1560, GROUND_Y, 1680, GROUND_Y - 85, 1850, GROUND_Y],
    ];
    nearPeaks.forEach(([x1, y1, x2, y2, x3, y3]) => {
      nearG.fillTriangle(x1, y1, x2, y2, x3, y3);
    });
    nearG.generateTexture('bg_near_mtn', nearMtnW, GROUND_Y);
    nearG.destroy();
    this.add.image(nearMtnW / 2, GROUND_Y / 2, 'bg_near_mtn').setScrollFactor(0.4).setDepth(3);

    // Layer 5 — Trees (scrollFactor 0.7)
    const treeW = Math.ceil(viewW + (GAME_W - viewW) * 0.7);
    const treeG = this.add.graphics();
    const treePositions = [];
    for (let tx = 30; tx < treeW; tx += 40 + Math.random() * 60) {
      treePositions.push(tx);
    }
    treePositions.forEach((tx) => {
      const treeH = 30 + Math.random() * 30;
      const trunkH = 10 + Math.random() * 8;
      const baseY = GROUND_Y;
      // Trunk
      treeG.fillStyle(0x5a3a1a, 1);
      treeG.fillRect(tx - 2, baseY - trunkH, 4, trunkH);
      // Canopy (triangle)
      treeG.fillStyle(0x2d5a1e, 1);
      treeG.fillTriangle(
        tx - 10 - Math.random() * 5, baseY - trunkH,
        tx, baseY - trunkH - treeH,
        tx + 10 + Math.random() * 5, baseY - trunkH,
      );
    });
    treeG.generateTexture('bg_trees', treeW, GROUND_Y);
    treeG.destroy();
    this.add.image(treeW / 2, GROUND_Y / 2, 'bg_trees').setScrollFactor(0.7).setDepth(4);
  }

  drawArcher(g, w, h, color, pose = 'idle') {
    const cx = w / 2;
    const headR = 4;
    const headY = 4 + headR;
    const neckY = headY + headR;
    const bodyEnd = h - 12;
    const footY = h - 2;

    // Head
    g.fillStyle(color, 1);
    g.fillCircle(cx, headY, headR);
    // Body
    g.lineStyle(2, color, 1);
    g.beginPath();
    g.moveTo(cx, neckY);
    g.lineTo(cx, bodyEnd);
    g.strokePath();
    // Legs
    g.beginPath();
    if (pose === 'walk_0') {
      g.moveTo(cx - 7, footY);
      g.lineTo(cx, bodyEnd);
      g.lineTo(cx + 3, footY);
    } else if (pose === 'walk_1') {
      g.moveTo(cx - 3, footY);
      g.lineTo(cx, bodyEnd);
      g.lineTo(cx + 7, footY);
    } else {
      g.moveTo(cx - 5, footY);
      g.lineTo(cx, bodyEnd);
      g.lineTo(cx + 5, footY);
    }
    g.strokePath();
    // Arms
    const armY = neckY + 6;
    if (pose === 'attack_0') {
      // Bowstring pulled back
      g.beginPath();
      g.moveTo(cx - 2, armY + 2);
      g.lineTo(cx, armY);
      g.lineTo(cx + 6, armY - 2);
      g.strokePath();
      g.lineStyle(2, 0x8B4513, 1);
      g.beginPath();
      g.arc(cx + 8, armY, 8, -Math.PI * 0.6, Math.PI * 0.6, false);
      g.strokePath();
      g.lineStyle(1, 0xcccccc, 1);
      g.beginPath();
      const bowTopX = cx + 8 + 8 * Math.cos(-Math.PI * 0.6);
      const bowTopY = armY + 8 * Math.sin(-Math.PI * 0.6);
      const bowBotX = cx + 8 + 8 * Math.cos(Math.PI * 0.6);
      const bowBotY = armY + 8 * Math.sin(Math.PI * 0.6);
      g.moveTo(bowTopX, bowTopY);
      g.lineTo(cx + 2, armY); // pulled back
      g.lineTo(bowBotX, bowBotY);
      g.strokePath();
    } else if (pose === 'attack_1') {
      // Bowstring released
      g.beginPath();
      g.moveTo(cx - 6, armY + 4);
      g.lineTo(cx, armY);
      g.lineTo(cx + 6, armY - 2);
      g.strokePath();
      g.lineStyle(2, 0x8B4513, 1);
      g.beginPath();
      g.arc(cx + 8, armY, 8, -Math.PI * 0.6, Math.PI * 0.6, false);
      g.strokePath();
      g.lineStyle(1, 0xcccccc, 1);
      g.beginPath();
      const bowTopX = cx + 8 + 8 * Math.cos(-Math.PI * 0.6);
      const bowTopY = armY + 8 * Math.sin(-Math.PI * 0.6);
      const bowBotX = cx + 8 + 8 * Math.cos(Math.PI * 0.6);
      const bowBotY = armY + 8 * Math.sin(Math.PI * 0.6);
      g.moveTo(bowTopX, bowTopY);
      g.lineTo(bowBotX, bowBotY);
      g.strokePath();
      // Arrow flying
      g.lineStyle(1, 0x8B4513, 1);
      g.beginPath();
      g.moveTo(cx + 14, armY - 1);
      g.lineTo(cx + 20, armY - 1);
      g.strokePath();
    } else {
      // Idle / walk — standard bow pose
      g.beginPath();
      g.moveTo(cx - 6, armY + 4);
      g.lineTo(cx, armY);
      g.lineTo(cx + 6, armY - 2);
      g.strokePath();
      g.lineStyle(2, 0x8B4513, 1);
      g.beginPath();
      g.arc(cx + 8, armY, 8, -Math.PI * 0.6, Math.PI * 0.6, false);
      g.strokePath();
      g.lineStyle(1, 0xcccccc, 1);
      g.beginPath();
      const bowTopX = cx + 8 + 8 * Math.cos(-Math.PI * 0.6);
      const bowTopY = armY + 8 * Math.sin(-Math.PI * 0.6);
      const bowBotX = cx + 8 + 8 * Math.cos(Math.PI * 0.6);
      const bowBotY = armY + 8 * Math.sin(Math.PI * 0.6);
      g.moveTo(bowTopX, bowTopY);
      g.lineTo(bowBotX, bowBotY);
      g.strokePath();
    }
  }

  drawWarrior(g, w, h, color, pose = 'idle') {
    const cx = w / 2;
    const headR = 5;
    const headY = 4 + headR;
    const neckY = headY + headR;
    const bodyEnd = h - 14;
    const footY = h - 2;

    // Head
    g.fillStyle(color, 1);
    g.fillCircle(cx, headY, headR);
    // Body
    g.lineStyle(2, color, 1);
    g.beginPath();
    g.moveTo(cx, neckY);
    g.lineTo(cx, bodyEnd);
    g.strokePath();
    // Legs
    g.beginPath();
    if (pose === 'walk_0') {
      g.moveTo(cx - 9, footY);
      g.lineTo(cx, bodyEnd);
      g.lineTo(cx + 3, footY);
    } else if (pose === 'walk_1') {
      g.moveTo(cx - 3, footY);
      g.lineTo(cx, bodyEnd);
      g.lineTo(cx + 9, footY);
    } else {
      g.moveTo(cx - 6, footY);
      g.lineTo(cx, bodyEnd);
      g.lineTo(cx + 6, footY);
    }
    g.strokePath();
    // Arms & weapon
    const armY = neckY + 6;
    // Left arm holding shield (always)
    g.beginPath();
    g.moveTo(cx - 8, armY + 2);
    g.lineTo(cx, armY);
    g.strokePath();
    g.fillStyle(0x666688, 1);
    g.fillRect(cx - 12, armY - 2, 5, 8);

    if (pose === 'attack_0') {
      // Sword raised high
      g.lineStyle(2, color, 1);
      g.beginPath();
      g.moveTo(cx, armY);
      g.lineTo(cx + 5, armY - 10);
      g.strokePath();
      g.lineStyle(2, 0xcccccc, 1);
      g.beginPath();
      g.moveTo(cx + 5, armY - 10);
      g.lineTo(cx + 4, armY - 22);
      g.strokePath();
    } else if (pose === 'attack_1') {
      // Sword swung down
      g.lineStyle(2, color, 1);
      g.beginPath();
      g.moveTo(cx, armY);
      g.lineTo(cx + 10, armY + 4);
      g.strokePath();
      g.lineStyle(2, 0xcccccc, 1);
      g.beginPath();
      g.moveTo(cx + 10, armY + 4);
      g.lineTo(cx + 16, armY + 10);
      g.strokePath();
    } else {
      // Idle / walk — sword held ready
      g.lineStyle(2, color, 1);
      g.beginPath();
      g.moveTo(cx, armY);
      g.lineTo(cx + 7, armY - 6);
      g.strokePath();
      g.lineStyle(2, 0xcccccc, 1);
      g.beginPath();
      g.moveTo(cx + 7, armY - 6);
      g.lineTo(cx + 9, armY - 16);
      g.strokePath();
    }
  }

  drawSpearman(g, w, h, color, pose = 'idle') {
    const cx = w / 2;
    const headR = 5;
    const headY = 4 + headR;
    const neckY = headY + headR;
    const bodyEnd = h - 16;
    const footY = h - 2;

    // Head
    g.fillStyle(color, 1);
    g.fillCircle(cx, headY, headR);
    // Body
    g.lineStyle(2, color, 1);
    g.beginPath();
    g.moveTo(cx, neckY);
    g.lineTo(cx, bodyEnd);
    g.strokePath();
    // Legs
    g.beginPath();
    if (pose === 'walk_0') {
      g.moveTo(cx - 9, footY);
      g.lineTo(cx, bodyEnd);
      g.lineTo(cx + 3, footY);
    } else if (pose === 'walk_1') {
      g.moveTo(cx - 3, footY);
      g.lineTo(cx, bodyEnd);
      g.lineTo(cx + 9, footY);
    } else {
      g.moveTo(cx - 6, footY);
      g.lineTo(cx, bodyEnd);
      g.lineTo(cx + 6, footY);
    }
    g.strokePath();
    // Arms & spear
    const armY = neckY + 6;
    if (pose === 'attack_0') {
      // Spear pulled back
      g.lineStyle(2, color, 1);
      g.beginPath();
      g.moveTo(cx - 4, armY + 4);
      g.lineTo(cx, armY);
      g.lineTo(cx + 4, armY);
      g.strokePath();
      g.lineStyle(2, 0x8B4513, 1);
      g.beginPath();
      g.moveTo(cx - 2, armY + 4);
      g.lineTo(cx + 6, armY - 14);
      g.strokePath();
      g.fillStyle(0xcccccc, 1);
      g.fillTriangle(cx + 6, armY - 18, cx + 3, armY - 12, cx + 9, armY - 12);
    } else if (pose === 'attack_1') {
      // Spear thrust forward
      g.lineStyle(2, color, 1);
      g.beginPath();
      g.moveTo(cx - 4, armY + 2);
      g.lineTo(cx, armY);
      g.lineTo(cx + 8, armY - 2);
      g.strokePath();
      g.lineStyle(2, 0x8B4513, 1);
      g.beginPath();
      g.moveTo(cx + 2, armY + 2);
      g.lineTo(cx + 16, armY - 8);
      g.strokePath();
      g.fillStyle(0xcccccc, 1);
      g.fillTriangle(cx + 16, armY - 12, cx + 13, armY - 6, cx + 19, armY - 6);
    } else {
      // Idle / walk — standard spear pose
      g.beginPath();
      g.moveTo(cx - 4, armY + 4);
      g.lineTo(cx, armY);
      g.lineTo(cx + 6, armY - 2);
      g.strokePath();
      g.lineStyle(2, 0x8B4513, 1);
      g.beginPath();
      g.moveTo(cx + 2, armY + 8);
      g.lineTo(cx + 10, armY - 20);
      g.strokePath();
      g.fillStyle(0xcccccc, 1);
      g.fillTriangle(cx + 10, armY - 24, cx + 7, armY - 18, cx + 13, armY - 18);
    }
  }

  drawGiant(g, w, h, color, pose = 'idle') {
    const cx = w / 2;
    const headR = 7;
    const headY = 4 + headR;
    const neckY = headY + headR;
    const bodyEnd = h - 18;
    const footY = h - 2;

    // Head
    g.fillStyle(color, 1);
    g.fillCircle(cx, headY, headR);
    // Body (thicker)
    g.lineStyle(4, color, 1);
    g.beginPath();
    g.moveTo(cx, neckY);
    g.lineTo(cx, bodyEnd);
    g.strokePath();
    // Legs (thicker)
    g.beginPath();
    if (pose === 'walk_0') {
      g.moveTo(cx - 12, footY);
      g.lineTo(cx, bodyEnd);
      g.lineTo(cx + 4, footY);
    } else if (pose === 'walk_1') {
      g.moveTo(cx - 4, footY);
      g.lineTo(cx, bodyEnd);
      g.lineTo(cx + 12, footY);
    } else {
      g.moveTo(cx - 8, footY);
      g.lineTo(cx, bodyEnd);
      g.lineTo(cx + 8, footY);
    }
    g.strokePath();
    // Arms & club
    const armY = neckY + 8;
    g.lineStyle(3, color, 1);
    if (pose === 'attack_0') {
      // Club raised high overhead
      g.beginPath();
      g.moveTo(cx - 10, armY + 4);
      g.lineTo(cx, armY);
      g.lineTo(cx + 6, armY - 12);
      g.strokePath();
      g.lineStyle(3, 0x8B4513, 1);
      g.beginPath();
      g.moveTo(cx + 6, armY - 12);
      g.lineTo(cx + 4, armY - 28);
      g.strokePath();
      g.fillStyle(0x664422, 1);
      g.fillCircle(cx + 4, armY - 31, 5);
    } else if (pose === 'attack_1') {
      // Club swung down
      g.beginPath();
      g.moveTo(cx - 10, armY + 4);
      g.lineTo(cx, armY);
      g.lineTo(cx + 12, armY + 6);
      g.strokePath();
      g.lineStyle(3, 0x8B4513, 1);
      g.beginPath();
      g.moveTo(cx + 12, armY + 6);
      g.lineTo(cx + 18, armY + 14);
      g.strokePath();
      g.fillStyle(0x664422, 1);
      g.fillCircle(cx + 18, armY + 17, 5);
    } else {
      // Idle / walk — club resting on shoulder
      g.beginPath();
      g.moveTo(cx - 10, armY + 4);
      g.lineTo(cx, armY);
      g.lineTo(cx + 10, armY - 8);
      g.strokePath();
      g.lineStyle(3, 0x8B4513, 1);
      g.beginPath();
      g.moveTo(cx + 10, armY - 8);
      g.lineTo(cx + 14, armY - 22);
      g.strokePath();
      g.fillStyle(0x664422, 1);
      g.fillCircle(cx + 14, armY - 25, 5);
    }
  }

  // ── Spawning ────────────────────────────────────────────────
  spawnUnit(type) {
    if (this.gameOver) return;
    if (this.gold < type.cost) { this.sfx.errorBuzz(); return; }
    this.gold -= type.cost;
    this.sfx.playerSpawn();
    this.updateGoldText();

    const w = this.add.sprite(100, GROUND_Y - type.height / 2, textureKey(type.name, 'player', 'idle')).setDepth(10);
    this.physics.add.existing(w);
    w.body.setSize(type.width, type.height);
    w.body.setOffset(8, 4);
    w.body.setCollideWorldBounds(true);
    this.warriors.add(w);

    w.hp = type.hp;
    w.maxHp = type.hp;
    w.attacking = false;
    w.attackTarget = null;
    w.speed = type.speed * this.speedMultiplier;
    w.damage = type.damage;
    w.faction = 'player';
    w.unitCost = type.cost;
    w.unitWidth = type.width;
    w.unitHeight = type.height;
    w.unitTypeName = type.name;
    w.animState = 'walk';
    w.play(animKey(type.name, 'player', 'walk'));

    // HP bar
    w.hpBar = this.add.rectangle(w.x, w.y - type.height / 2 - 6, type.width, 4, 0x00ff00).setDepth(11);
  }

  spawnEnemy() {
    if (this.gameOver) return;

    const affordable = UNIT_TYPES.filter((t) => t.cost <= this.enemyGold);
    if (affordable.length === 0) return;

    const type = Phaser.Utils.Array.GetRandom(affordable);
    this.enemyGold -= type.cost;
    this.sfx.enemySpawn();
    const e = this.add.sprite(GAME_W - 100, GROUND_Y - type.height / 2, textureKey(type.name, 'enemy', 'idle')).setDepth(10);
    e.setFlipX(true);
    this.physics.add.existing(e);
    e.body.setSize(type.width, type.height);
    e.body.setOffset(8, 4);
    e.body.setCollideWorldBounds(true);
    this.enemies.add(e);

    e.hp = type.hp * this.difficulty.enemyHpMult;
    e.maxHp = e.hp;
    e.attacking = false;
    e.attackTarget = null;
    e.speed = type.speed;
    e.damage = type.damage * this.difficulty.enemyDmgMult;
    e.faction = 'enemy';
    e.unitCost = type.cost;
    e.unitWidth = type.width;
    e.unitHeight = type.height;
    e.unitTypeName = type.name;
    e.animState = 'walk';
    e.play(animKey(type.name, 'enemy', 'walk'));

    e.hpBar = this.add.rectangle(e.x, e.y - type.height / 2 - 6, type.width, 4, 0xff0000).setDepth(11);
  }

  // ── Combat ──────────────────────────────────────────────────
  unitFight(warrior, enemy) {
    if (warrior.dying || enemy.dying) return;
    // Both units stop and attack each other
    warrior.body.setVelocityX(0);
    enemy.body.setVelocityX(0);
    warrior.attacking = true;
    warrior.attackTarget = enemy;
    enemy.attacking = true;
    enemy.attackTarget = warrior;

    // Throttled combat sound
    const now = this.time.now;
    if (now - this.lastCombatHitTime > 300) {
      this.lastCombatHitTime = now;
      this.sfx.combatHit();
    }
  }

  // ── Update loop ─────────────────────────────────────────────
  update(time, delta) {
    if (this.gameOver) return;

    const dt = delta / 1000;

    // ── Camera panning (keyboard + on-screen buttons) ────────
    const camSpeed = 400;
    if (this.cursors.left.isDown || this.camLeft) {
      this.cameras.main.scrollX -= camSpeed * dt;
    } else if (this.cursors.right.isDown || this.camRight) {
      this.cameras.main.scrollX += camSpeed * dt;
    }

    // ── Ability cooldowns ─────────────────────────────────────
    for (const id in this.abilityCooldowns) {
      if (this.abilityCooldowns[id] > 0) {
        this.abilityCooldowns[id] -= dt;
        if (this.abilityCooldowns[id] < 0) this.abilityCooldowns[id] = 0;
      }
    }

    // ── Warriors ──────────────────────────────────────────────
    this.warriors.getChildren().forEach((w) => {
      if (!w.active || w.dying) return;

      // If target died, resume walking
      if (w.attackTarget && !w.attackTarget.active) {
        w.attacking = false;
        w.attackTarget = null;
      }

      let newAnimState = 'walk';
      if (w.attacking && w.attackTarget) {
        // Attack another unit
        newAnimState = 'attack';
        const dmg = w.damage * dt;
        w.attackTarget.hp -= dmg;
        this.accumulateDamage(w.attackTarget, dmg, time);
        if (w.attackTarget.hp <= 0) {
          this.killUnit(w.attackTarget);
          w.attacking = false;
          w.attackTarget = null;
        }
      } else if (this.isAtEnemyBase(w)) {
        // Attack enemy base
        newAnimState = 'attack';
        w.body.setVelocityX(0);
        const dmg = w.damage * dt;
        this.enemyBaseHP -= dmg;
        this.accumulateDamage(this.enemyBase, dmg, time);
        this.enemyHPText.setText(`HP: ${Math.ceil(Math.max(0, this.enemyBaseHP))}`);
        if (time - this.lastBaseDamageTime > 300) { this.lastBaseDamageTime = time; this.sfx.baseDamage(); }
        if (this.enemyBaseHP <= 0) this.endGame('You Win!');
      } else {
        w.body.setVelocityX(w.speed);
      }

      // Switch animation only on state change
      if (w.animState !== newAnimState) {
        w.animState = newAnimState;
        w.play(animKey(w.unitTypeName, w.faction, newAnimState));
      }

      // Update HP bar
      if (w.active && w.hpBar) {
        w.hpBar.setPosition(w.x, w.y - w.unitHeight / 2 - 6);
        w.hpBar.width = w.unitWidth * (w.hp / w.maxHp);
      }
    });

    // ── Enemies ──────────────────────────────────────────────
    this.enemies.getChildren().forEach((e) => {
      if (!e.active || e.dying) return;

      if (e.attackTarget && !e.attackTarget.active) {
        e.attacking = false;
        e.attackTarget = null;
      }

      let newAnimState = 'walk';
      if (e.attacking && e.attackTarget) {
        newAnimState = 'attack';
        const dmg = e.damage * dt;
        e.attackTarget.hp -= dmg;
        this.accumulateDamage(e.attackTarget, dmg, time);
        if (e.attackTarget.hp <= 0) {
          this.killUnit(e.attackTarget);
          e.attacking = false;
          e.attackTarget = null;
        }
      } else if (this.isAtPlayerBase(e)) {
        newAnimState = 'attack';
        e.body.setVelocityX(0);
        const dmg = e.damage * dt;
        this.playerBaseHP -= dmg;
        this.accumulateDamage(this.playerBase, dmg, time);
        this.playerHPText.setText(`HP: ${Math.ceil(Math.max(0, this.playerBaseHP))}`);
        if (time - this.lastBaseDamageTime > 300) { this.lastBaseDamageTime = time; this.sfx.baseDamage(); }
        if (this.playerBaseHP <= 0) this.endGame('Game Over');
      } else {
        e.body.setVelocityX(-e.speed);
      }

      // Switch animation only on state change
      if (e.animState !== newAnimState) {
        e.animState = newAnimState;
        e.play(animKey(e.unitTypeName, e.faction, newAnimState));
      }

      if (e.active && e.hpBar) {
        e.hpBar.setPosition(e.x, e.y - e.unitHeight / 2 - 6);
        e.hpBar.width = e.unitWidth * (e.hp / e.maxHp);
      }
    });

    // ── Update minimap ─────────────────────────────────────────
    const mm = this.minimapPos;
    const vpW = (1024 / GAME_W) * mm.w;
    const vpX = mm.x + (this.cameras.main.scrollX / GAME_W) * mm.w + vpW / 2;
    this.minimapVP.setPosition(vpX, mm.y + mm.h / 2);

    this.minimapGfx.clear();
    this.warriors.getChildren().forEach((w) => {
      if (!w.active) return;
      const dotX = mm.x + (w.x / GAME_W) * mm.w;
      this.minimapGfx.fillStyle(0x33cc33, 1);
      this.minimapGfx.fillCircle(dotX, mm.y + mm.h / 2, 2);
    });
    this.enemies.getChildren().forEach((e) => {
      if (!e.active) return;
      const dotX = mm.x + (e.x / GAME_W) * mm.w;
      this.minimapGfx.fillStyle(0xff4444, 1);
      this.minimapGfx.fillCircle(dotX, mm.y + mm.h / 2, 2);
    });
  }

  // ── Helpers ─────────────────────────────────────────────────
  showDamageNumber(x, y, amount, color = '#ffffff') {
    const txt = this.add.text(x, y - 10, Math.ceil(amount).toString(), {
      fontSize: '14px', color, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setDepth(15).setOrigin(0.5);
    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power1',
      onComplete: () => txt.destroy(),
    });
  }

  accumulateDamage(unit, amount, time) {
    if (!unit.dmgAccum) unit.dmgAccum = 0;
    if (!unit.lastDmgTime) unit.lastDmgTime = 0;
    unit.dmgAccum += amount;
    if (time - unit.lastDmgTime >= 500) {
      const color = unit.faction === 'enemy' ? '#ff4444' : '#44aaff';
      this.showDamageNumber(unit.x, unit.y - unit.unitHeight / 2, unit.dmgAccum, color);
      unit.dmgAccum = 0;
      unit.lastDmgTime = time;
    }
  }

  isAtEnemyBase(unit) {
    return unit.x >= this.enemyBase.x - 60;
  }

  isAtPlayerBase(unit) {
    return unit.x <= this.playerBase.x + 60;
  }

  killUnit(unit) {
    if (unit.dying) return;
    unit.dying = true;

    if (unit.hpBar) unit.hpBar.destroy();
    this.sfx.unitDeath();
    // Award gold for killing enemies (cost / 5)
    if (unit.faction === 'enemy') {
      this.gold += Math.floor(unit.unitCost / 5);
      this.sfx.coinChime();
    }
    this.updateGoldText();

    // Remove from physics group immediately to stop combat callbacks
    if (unit.faction === 'player') {
      this.warriors.remove(unit);
    } else {
      this.enemies.remove(unit);
    }
    if (unit.body) unit.body.enable = false;
    unit.stop(); // stop any playing animation

    // Death tween: fall backward and fade out
    const fallAngle = unit.faction === 'player' ? -90 : 90;
    this.tweens.add({
      targets: unit,
      angle: fallAngle,
      alpha: 0,
      duration: 500,
      ease: 'Power1',
      onComplete: () => { if (unit.active) unit.destroy(); },
    });
  }

  updateGoldText() {
    if (this.goldText) this.goldText.setText(`Gold: ${this.gold}`);
  }

  // ── Shop ──────────────────────────────────────────────────

  toggleShop() {
    if (this.gameOver) return;
    if (this.shopOpen) {
      this.closeShop();
    } else {
      this.openShop();
    }
  }

  openShop() {
    this.shopOpen = true;
    this.shopElements = [];

    // Backdrop — blocks clicks to game underneath
    const backdrop = this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.5)
      .setScrollFactor(0).setDepth(29).setInteractive();
    backdrop.on('pointerdown', () => this.closeShop());
    this.shopElements.push(backdrop);

    // Panel
    const panelW = 460;
    const panelH = 380;
    const panelX = 512;
    const panelY = 288;

    const panel = this.add.rectangle(panelX, panelY, panelW, panelH, 0x1a1a2e, 0.95)
      .setScrollFactor(0).setDepth(30).setStrokeStyle(2, 0xffd700);
    panel.setInteractive(); // prevent click-through to backdrop
    this.shopElements.push(panel);

    // Title
    const title = this.add.text(panelX, panelY - panelH / 2 + 25, 'ABILITIES SHOP', {
      fontSize: '20px', color: '#FFD700', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);
    this.shopElements.push(title);

    // Close button
    const closeBtn = this.add.text(panelX + panelW / 2 - 20, panelY - panelH / 2 + 10, 'X', {
      fontSize: '18px', color: '#ff4444', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(32).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeShop());
    this.shopElements.push(closeBtn);

    // Ability rows
    const rowStartY = panelY - panelH / 2 + 70;
    const rowH = 70;

    ABILITIES.forEach((ability, i) => {
      const rowY = rowStartY + i * rowH;
      const leftX = panelX - panelW / 2 + 20;

      // Color icon
      const icon = this.add.rectangle(leftX + 15, rowY + 15, 26, 26, ability.color)
        .setScrollFactor(0).setDepth(31);
      this.shopElements.push(icon);

      // Name
      const nameText = this.add.text(leftX + 38, rowY, ability.name, {
        fontSize: '15px', color: '#ffffff', fontStyle: 'bold',
      }).setScrollFactor(0).setDepth(31);
      this.shopElements.push(nameText);

      // Description
      const descText = this.add.text(leftX + 38, rowY + 20, ability.description, {
        fontSize: '12px', color: '#aaaaaa',
      }).setScrollFactor(0).setDepth(31);
      this.shopElements.push(descText);

      // Cost
      const costText = this.add.text(leftX + 38, rowY + 38, `${ability.cost}g`, {
        fontSize: '12px', color: '#FFD700',
      }).setScrollFactor(0).setDepth(31);
      this.shopElements.push(costText);

      // Button
      const btnX = panelX + panelW / 2 - 60;
      const btnY = rowY + 18;

      let btnLabel = '';
      let btnColor = 0x228822;
      let clickable = true;

      if (ability.type === 'passive' && this.purchasedPassives.has(ability.id)) {
        btnLabel = 'OWNED';
        btnColor = 0x555555;
        clickable = false;
      } else if (this.abilityCooldowns[ability.id] && this.abilityCooldowns[ability.id] > 0) {
        btnLabel = `${Math.ceil(this.abilityCooldowns[ability.id])}s`;
        btnColor = 0x555555;
        clickable = false;
      } else if (this.gold < ability.cost) {
        btnLabel = ability.type === 'passive' ? 'BUY' : 'USE';
        btnColor = 0x661111;
        clickable = true; // will show error buzz
      } else {
        btnLabel = ability.type === 'passive' ? 'BUY' : 'USE';
        btnColor = 0x228822;
      }

      const btnBg = this.add.rectangle(btnX, btnY, 70, 30, btnColor, 0.9)
        .setScrollFactor(0).setDepth(31).setInteractive({ useHandCursor: clickable });
      this.shopElements.push(btnBg);

      const btnText = this.add.text(btnX, btnY, btnLabel, {
        fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(32);
      this.shopElements.push(btnText);

      if (clickable) {
        btnBg.on('pointerdown', () => this.purchaseAbility(ability));
      }
    });

    // Refresh timer — rebuilds panel every second while open to update cooldowns/gold
    this.shopCooldownTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.shopOpen) {
          this.closeShop();
          this.openShop();
        }
      },
    });
  }

  closeShop() {
    this.shopOpen = false;
    this.shopElements.forEach((el) => el.destroy());
    this.shopElements = [];
    if (this.shopCooldownTimer) {
      this.shopCooldownTimer.destroy();
      this.shopCooldownTimer = null;
    }
  }

  purchaseAbility(ability) {
    if (this.gameOver) return;

    // Check if passive already owned
    if (ability.type === 'passive' && this.purchasedPassives.has(ability.id)) return;

    // Check cooldown
    if (this.abilityCooldowns[ability.id] && this.abilityCooldowns[ability.id] > 0) return;

    // Check gold
    if (this.gold < ability.cost) {
      this.sfx.errorBuzz();
      return;
    }

    this.gold -= ability.cost;
    this.updateGoldText();
    this.sfx.abilityPurchase();

    this.applyAbility(ability);

    // Refresh shop UI
    this.closeShop();
    this.openShop();
  }

  applyAbility(ability) {
    switch (ability.id) {
      case 'rainOfArrows': this.applyRainOfArrows(ability); break;
      case 'healBase':     this.applyHealBase(ability);     break;
      case 'warDrums':     this.applyWarDrums(ability);     break;
      case 'goldMine':     this.applyGoldMine(ability);     break;
    }
  }

  applyRainOfArrows(ability) {
    this.abilityCooldowns[ability.id] = ability.cooldown;
    this.sfx.rainOfArrows();
    this.cameras.main.flash(300, 255, 100, 100);

    this.enemies.getChildren().forEach((e) => {
      if (!e.active || e.dying) return;
      e.hp -= 30;
      this.showDamageNumber(e.x, e.y - e.unitHeight / 2, 30, '#ff4444');
      if (e.hp <= 0) this.killUnit(e);
    });
  }

  applyHealBase(ability) {
    this.abilityCooldowns[ability.id] = ability.cooldown;
    this.sfx.healEffect();
    this.cameras.main.flash(300, 100, 255, 100);

    const healed = Math.min(100, BASE_HP - this.playerBaseHP);
    this.playerBaseHP = Math.min(BASE_HP, this.playerBaseHP + 100);
    this.playerHPText.setText(`HP: ${Math.ceil(this.playerBaseHP)}`);
    if (healed > 0) {
      this.showDamageNumber(this.playerBase.x, this.playerBase.y - 60, healed, '#44ff44');
    }
  }

  applyWarDrums(ability) {
    this.purchasedPassives.add(ability.id);
    this.speedMultiplier = 1.2;

    // Boost all existing warriors
    this.warriors.getChildren().forEach((w) => {
      if (!w.active || w.dying) return;
      w.speed *= 1.2;
    });

    this.updateActiveBuffsDisplay();
  }

  applyGoldMine(ability) {
    this.purchasedPassives.add(ability.id);
    this.goldIncomeMultiplier = 2;
    this.updateActiveBuffsDisplay();
  }

  updateActiveBuffsDisplay() {
    if (this.activeBuffsText) this.activeBuffsText.destroy();

    const buffs = [];
    if (this.purchasedPassives.has('warDrums')) buffs.push('War Drums');
    if (this.purchasedPassives.has('goldMine')) buffs.push('Gold Mine');

    if (buffs.length > 0) {
      this.activeBuffsText = this.add.text(16, 40, buffs.join(' | '), {
        fontSize: '12px', color: '#88ff88',
      }).setScrollFactor(0).setDepth(20);
    }
  }

  endGame(message) {
    this.gameOver = true;
    if (this.shopOpen) this.closeShop();
    if (this.music) this.music.stop();
    if (message === 'You Win!') this.sfx.victory();
    else this.sfx.defeat();
    // Stop all units and set to idle texture
    this.warriors.getChildren().forEach((w) => {
      if (!w.active || w.dying) return;
      if (w.body) w.body.setVelocityX(0);
      w.stop();
      w.setTexture(textureKey(w.unitTypeName, w.faction, 'idle'));
    });
    this.enemies.getChildren().forEach((e) => {
      if (!e.active || e.dying) return;
      if (e.body) e.body.setVelocityX(0);
      e.stop();
      e.setTexture(textureKey(e.unitTypeName, e.faction, 'idle'));
    });

    this.add.text(512, 200, message, {
      fontSize: '48px',
      color: message === 'You Win!' ? '#00ff00' : '#ff0000',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

    this.add.text(512, 260, 'Click to return to menu', {
      fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

    this.input.once('pointerdown', () => this.scene.start('MenuScene'));
  }
}
