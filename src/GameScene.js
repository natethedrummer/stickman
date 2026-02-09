import Phaser from 'phaser';
import { SoundFX } from './SoundFX.js';

const GROUND_Y = 500;
const GAME_W = 3072;

const UNIT_TYPES = [
  { name: 'Archer',   cost: 25,  hp: 25,  damage: 15, speed: 50, width: 16, height: 32, color: 0x33cc33 },
  { name: 'Warrior',  cost: 50,  hp: 50,  damage: 10, speed: 50, width: 24, height: 40, color: 0x3399ff },
  { name: 'Spearman', cost: 75,  hp: 65,  damage: 12, speed: 60, width: 20, height: 44, color: 0xff8800 },
  { name: 'Giant',    cost: 150, hp: 150, damage: 20, speed: 30, width: 36, height: 52, color: 0x9933ff },
];

const ENEMY_SPAWN_INTERVAL = 5000;

const textureKey = (typeName, faction) => `${typeName.toLowerCase()}_${faction}`;

const BASE_HP = 500;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.audio('bgMusic', 'music/bg-music.mp3');
  }

  create() {
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
    this.physics.add.existing(this.playerBase, true);
    this.playerBaseLabel = this.add.text(20, GROUND_Y - 140, 'Your Base', {
      fontSize: '13px', color: '#ffffff',
    }).setDepth(10);
    this.playerHPText = this.add.text(20, GROUND_Y - 125, `HP: ${this.playerBaseHP}`, {
      fontSize: '12px', color: '#ffffff',
    }).setDepth(10);

    // Enemy base (right)
    this.enemyBase = this.add.rectangle(GAME_W - 60, GROUND_Y - 60, 80, 120, 0xcc4444).setDepth(10);
    this.physics.add.existing(this.enemyBase, true);
    this.enemyBaseLabel = this.add.text(GAME_W - 110, GROUND_Y - 140, 'Enemy Base', {
      fontSize: '13px', color: '#ffffff',
    }).setDepth(10);
    this.enemyHPText = this.add.text(GAME_W - 110, GROUND_Y - 125, `HP: ${this.enemyBaseHP}`, {
      fontSize: '12px', color: '#ffffff',
    }).setDepth(10);

    // ── Gold ────────────────────────────────────────────────
    this.gold = 100;
    this.enemyGold = 100;
    this.goldText = this.add.text(16, 16, '', { fontSize: '20px', color: '#FFD700' }).setDepth(20);
    this.updateGoldText();

    // passive gold income: +10 per second
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.gold += 5;
        this.enemyGold += 5;
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
      delay: ENEMY_SPAWN_INTERVAL,
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

    // ── Sound effects ─────────────────────────────────────────
    this.sfx = new SoundFX(() => this.sound.mute);
    this.lastCombatHitTime = 0;
    this.lastBaseDamageTime = 0;

    // ── Mobile camera buttons ─────────────────────────────────
    this.camLeft = false;
    this.camRight = false;

    const arrowBtnSize = 56;
    const arrowY = 576 - arrowBtnSize / 2 - 12;
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

    // ── Game-over flag ──────────────────────────────────────
    this.gameOver = false;
  }

  // ── Texture generation ─────────────────────────────────────
  generateStickmanTextures() {
    const drawFns = {
      Archer: this.drawArcher,
      Warrior: this.drawWarrior,
      Spearman: this.drawSpearman,
      Giant: this.drawGiant,
    };

    UNIT_TYPES.forEach((type) => {
      const texW = type.width + 16;
      const texH = type.height + 4;

      [
        { faction: 'player', color: type.color },
        { faction: 'enemy', color: 0xff4444 },
      ].forEach(({ faction, color }) => {
        const g = this.add.graphics();
        const drawFn = drawFns[type.name];
        if (drawFn) drawFn(g, texW, texH, color);
        g.generateTexture(textureKey(type.name, faction), texW, texH);
        g.destroy();
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

  drawArcher(g, w, h, color) {
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
    // Legs (V-shape)
    g.beginPath();
    g.moveTo(cx - 5, footY);
    g.lineTo(cx, bodyEnd);
    g.lineTo(cx + 5, footY);
    g.strokePath();
    // Arms
    const armY = neckY + 6;
    g.beginPath();
    g.moveTo(cx - 6, armY + 4);
    g.lineTo(cx, armY);
    g.lineTo(cx + 6, armY - 2);
    g.strokePath();
    // Bow (arc on right side)
    g.lineStyle(2, 0x8B4513, 1);
    g.beginPath();
    g.arc(cx + 8, armY, 8, -Math.PI * 0.6, Math.PI * 0.6, false);
    g.strokePath();
    // Bowstring
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

  drawWarrior(g, w, h, color) {
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
    g.moveTo(cx - 6, footY);
    g.lineTo(cx, bodyEnd);
    g.lineTo(cx + 6, footY);
    g.strokePath();
    // Arms
    const armY = neckY + 6;
    // Left arm holding shield
    g.beginPath();
    g.moveTo(cx - 8, armY + 2);
    g.lineTo(cx, armY);
    g.strokePath();
    // Right arm raised with sword
    g.beginPath();
    g.moveTo(cx, armY);
    g.lineTo(cx + 7, armY - 6);
    g.strokePath();
    // Sword (from right hand upward)
    g.lineStyle(2, 0xcccccc, 1);
    g.beginPath();
    g.moveTo(cx + 7, armY - 6);
    g.lineTo(cx + 9, armY - 16);
    g.strokePath();
    // Shield (small rect on left)
    g.fillStyle(0x666688, 1);
    g.fillRect(cx - 12, armY - 2, 5, 8);
  }

  drawSpearman(g, w, h, color) {
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
    g.moveTo(cx - 6, footY);
    g.lineTo(cx, bodyEnd);
    g.lineTo(cx + 6, footY);
    g.strokePath();
    // Arms holding spear
    const armY = neckY + 6;
    g.beginPath();
    g.moveTo(cx - 4, armY + 4);
    g.lineTo(cx, armY);
    g.lineTo(cx + 6, armY - 2);
    g.strokePath();
    // Spear shaft (long diagonal)
    g.lineStyle(2, 0x8B4513, 1);
    g.beginPath();
    g.moveTo(cx + 2, armY + 8);
    g.lineTo(cx + 10, armY - 20);
    g.strokePath();
    // Spear tip (triangle)
    g.fillStyle(0xcccccc, 1);
    g.fillTriangle(
      cx + 10, armY - 24,
      cx + 7, armY - 18,
      cx + 13, armY - 18,
    );
  }

  drawGiant(g, w, h, color) {
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
    g.moveTo(cx - 8, footY);
    g.lineTo(cx, bodyEnd);
    g.lineTo(cx + 8, footY);
    g.strokePath();
    // Arms raised overhead holding club
    const armY = neckY + 8;
    g.lineStyle(3, color, 1);
    g.beginPath();
    g.moveTo(cx - 10, armY + 4);
    g.lineTo(cx, armY);
    g.lineTo(cx + 10, armY - 8);
    g.strokePath();
    // Club shaft (raised to the right)
    g.lineStyle(3, 0x8B4513, 1);
    g.beginPath();
    g.moveTo(cx + 10, armY - 8);
    g.lineTo(cx + 14, armY - 22);
    g.strokePath();
    // Club head (circle at top)
    g.fillStyle(0x664422, 1);
    g.fillCircle(cx + 14, armY - 25, 5);
  }

  // ── Spawning ────────────────────────────────────────────────
  spawnUnit(type) {
    if (this.gameOver) return;
    if (this.gold < type.cost) { this.sfx.errorBuzz(); return; }
    this.gold -= type.cost;
    this.sfx.playerSpawn();
    this.updateGoldText();

    const w = this.add.sprite(100, GROUND_Y - type.height / 2, textureKey(type.name, 'player')).setDepth(10);
    this.physics.add.existing(w);
    w.body.setSize(type.width, type.height);
    w.body.setOffset(8, 4);
    w.body.setCollideWorldBounds(true);
    this.warriors.add(w);

    w.hp = type.hp;
    w.maxHp = type.hp;
    w.attacking = false;
    w.attackTarget = null;
    w.speed = type.speed;
    w.damage = type.damage;
    w.faction = 'player';
    w.unitCost = type.cost;
    w.unitWidth = type.width;
    w.unitHeight = type.height;

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
    const e = this.add.sprite(GAME_W - 100, GROUND_Y - type.height / 2, textureKey(type.name, 'enemy')).setDepth(10);
    e.setFlipX(true);
    this.physics.add.existing(e);
    e.body.setSize(type.width, type.height);
    e.body.setOffset(8, 4);
    e.body.setCollideWorldBounds(true);
    this.enemies.add(e);

    e.hp = type.hp;
    e.maxHp = type.hp;
    e.attacking = false;
    e.attackTarget = null;
    e.speed = type.speed;
    e.damage = type.damage;
    e.faction = 'enemy';
    e.unitCost = type.cost;
    e.unitWidth = type.width;
    e.unitHeight = type.height;

    e.hpBar = this.add.rectangle(e.x, e.y - type.height / 2 - 6, type.width, 4, 0xff0000).setDepth(11);
  }

  // ── Combat ──────────────────────────────────────────────────
  unitFight(warrior, enemy) {
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

    // ── Warriors ──────────────────────────────────────────────
    this.warriors.getChildren().forEach((w) => {
      if (!w.active) return;

      // If target died, resume walking
      if (w.attackTarget && !w.attackTarget.active) {
        w.attacking = false;
        w.attackTarget = null;
      }

      if (w.attacking && w.attackTarget) {
        // Attack another unit
        w.attackTarget.hp -= w.damage * dt;
        if (w.attackTarget.hp <= 0) {
          this.killUnit(w.attackTarget);
          w.attacking = false;
          w.attackTarget = null;
        }
      } else if (this.isAtEnemyBase(w)) {
        // Attack enemy base
        w.body.setVelocityX(0);
        this.enemyBaseHP -= w.damage * dt;
        this.enemyHPText.setText(`HP: ${Math.ceil(Math.max(0, this.enemyBaseHP))}`);
        if (time - this.lastBaseDamageTime > 300) { this.lastBaseDamageTime = time; this.sfx.baseDamage(); }
        if (this.enemyBaseHP <= 0) this.endGame('You Win!');
      } else {
        w.body.setVelocityX(w.speed);
      }

      // Update HP bar
      if (w.active && w.hpBar) {
        w.hpBar.setPosition(w.x, w.y - w.unitHeight / 2 - 6);
        w.hpBar.width = w.unitWidth * (w.hp / w.maxHp);
      }
    });

    // ── Enemies ──────────────────────────────────────────────
    this.enemies.getChildren().forEach((e) => {
      if (!e.active) return;

      if (e.attackTarget && !e.attackTarget.active) {
        e.attacking = false;
        e.attackTarget = null;
      }

      if (e.attacking && e.attackTarget) {
        e.attackTarget.hp -= e.damage * dt;
        if (e.attackTarget.hp <= 0) {
          this.killUnit(e.attackTarget);
          e.attacking = false;
          e.attackTarget = null;
        }
      } else if (this.isAtPlayerBase(e)) {
        e.body.setVelocityX(0);
        this.playerBaseHP -= e.damage * dt;
        this.playerHPText.setText(`HP: ${Math.ceil(Math.max(0, this.playerBaseHP))}`);
        if (time - this.lastBaseDamageTime > 300) { this.lastBaseDamageTime = time; this.sfx.baseDamage(); }
        if (this.playerBaseHP <= 0) this.endGame('Game Over');
      } else {
        e.body.setVelocityX(-e.speed);
      }

      if (e.active && e.hpBar) {
        e.hpBar.setPosition(e.x, e.y - e.unitHeight / 2 - 6);
        e.hpBar.width = e.unitWidth * (e.hp / e.maxHp);
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────
  isAtEnemyBase(unit) {
    return unit.x >= this.enemyBase.x - 60;
  }

  isAtPlayerBase(unit) {
    return unit.x <= this.playerBase.x + 60;
  }

  killUnit(unit) {
    if (unit.hpBar) unit.hpBar.destroy();
    this.sfx.unitDeath();
    // Award gold for killing enemies (cost / 5)
    if (unit.faction === 'enemy') {
      this.gold += Math.floor(unit.unitCost / 5);
      this.sfx.coinChime();
    }
    this.updateGoldText();
    unit.destroy();
  }

  updateGoldText() {
    if (this.goldText) this.goldText.setText(`Gold: ${this.gold}`);
  }

  endGame(message) {
    this.gameOver = true;
    if (this.music) this.music.stop();
    if (message === 'You Win!') this.sfx.victory();
    else this.sfx.defeat();
    // Stop all units
    this.warriors.getChildren().forEach((w) => w.body && w.body.setVelocityX(0));
    this.enemies.getChildren().forEach((e) => e.body && e.body.setVelocityX(0));

    this.add.text(512, 200, message, {
      fontSize: '48px',
      color: message === 'You Win!' ? '#00ff00' : '#ff0000',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

    this.add.text(512, 260, 'Click to restart', {
      fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

    this.input.once('pointerdown', () => this.scene.restart());
  }
}
