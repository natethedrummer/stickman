import Phaser from 'phaser';

const GROUND_Y = 500;
const GAME_W = 1024;

const WARRIOR_COST = 50;
const WARRIOR_SPEED = 50;
const WARRIOR_DAMAGE = 10; // per second
const WARRIOR_HP = 60;

const ENEMY_SPEED = 50;
const ENEMY_DAMAGE = 8;
const ENEMY_HP = 40;
const ENEMY_SPAWN_INTERVAL = 5000;

const BASE_HP = 500;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // ── Ground ──────────────────────────────────────────────
    const ground = this.add.rectangle(GAME_W / 2, GROUND_Y + 40, GAME_W, 80, 0x3d8b37);
    this.physics.add.existing(ground, true); // static body
    this.ground = ground;

    // ── Bases ───────────────────────────────────────────────
    this.playerBaseHP = BASE_HP;
    this.enemyBaseHP = BASE_HP;

    // Player base (left)
    this.playerBase = this.add.rectangle(60, GROUND_Y - 60, 80, 120, 0x4444cc);
    this.physics.add.existing(this.playerBase, true);
    this.playerBaseLabel = this.add.text(20, GROUND_Y - 140, 'Your Base', {
      fontSize: '13px', color: '#ffffff',
    });
    this.playerHPText = this.add.text(20, GROUND_Y - 125, `HP: ${this.playerBaseHP}`, {
      fontSize: '12px', color: '#ffffff',
    });

    // Enemy base (right)
    this.enemyBase = this.add.rectangle(GAME_W - 60, GROUND_Y - 60, 80, 120, 0xcc4444);
    this.physics.add.existing(this.enemyBase, true);
    this.enemyBaseLabel = this.add.text(GAME_W - 110, GROUND_Y - 140, 'Enemy Base', {
      fontSize: '13px', color: '#ffffff',
    });
    this.enemyHPText = this.add.text(GAME_W - 110, GROUND_Y - 125, `HP: ${this.enemyBaseHP}`, {
      fontSize: '12px', color: '#ffffff',
    });

    // ── Gold ────────────────────────────────────────────────
    this.gold = 100;
    this.goldText = this.add.text(16, 16, '', { fontSize: '20px', color: '#FFD700' });
    this.updateGoldText();

    // passive gold income: +10 per second
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.gold += 5;
        this.updateGoldText();
      },
    });

    // ── Spawn button ────────────────────────────────────────
    const btn = this.add.rectangle(130, 20, 180, 36, 0x226622, 0.9).setOrigin(0, 0);
    const btnText = this.add.text(142, 26, `Spawn Warrior (${WARRIOR_COST}g)`, {
      fontSize: '15px', color: '#ffffff',
    });
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => this.spawnWarrior());

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

    // ── Game-over flag ──────────────────────────────────────
    this.gameOver = false;
  }

  // ── Spawning ────────────────────────────────────────────────
  spawnWarrior() {
    if (this.gameOver) return;
    if (this.gold < WARRIOR_COST) return;
    this.gold -= WARRIOR_COST;
    this.updateGoldText();

    const w = this.add.rectangle(100, GROUND_Y - 20, 24, 40, 0x3399ff);
    this.physics.add.existing(w);
    w.body.setCollideWorldBounds(true);
    this.warriors.add(w);

    w.getData = undefined; // use custom props
    w.hp = WARRIOR_HP;
    w.attacking = false;
    w.attackTarget = null;
    w.speed = WARRIOR_SPEED;
    w.damage = WARRIOR_DAMAGE;
    w.faction = 'player';

    // HP bar
    w.hpBar = this.add.rectangle(w.x, w.y - 28, 24, 4, 0x00ff00).setDepth(1);
  }

  spawnEnemy() {
    if (this.gameOver) return;

    const e = this.add.rectangle(GAME_W - 100, GROUND_Y - 20, 24, 40, 0xff4444);
    this.physics.add.existing(e);
    e.body.setCollideWorldBounds(true);
    this.enemies.add(e);

    e.hp = ENEMY_HP;
    e.attacking = false;
    e.attackTarget = null;
    e.speed = ENEMY_SPEED;
    e.damage = ENEMY_DAMAGE;
    e.faction = 'enemy';

    e.hpBar = this.add.rectangle(e.x, e.y - 28, 24, 4, 0xff0000).setDepth(1);
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
  }

  // ── Update loop ─────────────────────────────────────────────
  update(time, delta) {
    if (this.gameOver) return;

    const dt = delta / 1000;

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
        if (this.enemyBaseHP <= 0) this.endGame('You Win!');
      } else {
        w.body.setVelocityX(w.speed);
      }

      // Update HP bar
      if (w.active && w.hpBar) {
        w.hpBar.setPosition(w.x, w.y - 28);
        w.hpBar.width = 24 * (w.hp / WARRIOR_HP);
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
        if (this.playerBaseHP <= 0) this.endGame('Game Over');
      } else {
        e.body.setVelocityX(-e.speed);
      }

      if (e.active && e.hpBar) {
        e.hpBar.setPosition(e.x, e.y - 28);
        e.hpBar.width = 24 * (e.hp / ENEMY_HP);
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
    // Award gold for killing enemies
    if (unit.faction === 'enemy') this.gold += 10;
    this.updateGoldText();
    unit.destroy();
  }

  updateGoldText() {
    if (this.goldText) this.goldText.setText(`Gold: ${this.gold}`);
  }

  endGame(message) {
    this.gameOver = true;
    // Stop all units
    this.warriors.getChildren().forEach((w) => w.body && w.body.setVelocityX(0));
    this.enemies.getChildren().forEach((e) => e.body && e.body.setVelocityX(0));

    this.add.text(GAME_W / 2, 200, message, {
      fontSize: '48px',
      color: message === 'You Win!' ? '#00ff00' : '#ff0000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_W / 2, 260, 'Click to restart', {
      fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.restart());
  }
}
