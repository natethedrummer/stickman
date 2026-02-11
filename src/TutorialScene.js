import Phaser from 'phaser';

const STEPS = [
  {
    title: 'YOUR GOAL',
    text: 'Destroy the enemy base on the right\nside of the battlefield before they\ndestroy yours on the left!',
    icon: 'base',
  },
  {
    title: 'SPAWNING UNITS',
    text: 'Tap the unit buttons at the top of\nthe screen to spawn warriors.\nEach unit costs gold.',
    icon: 'units',
  },
  {
    title: 'EARNING GOLD',
    text: 'You earn gold automatically over time.\nYou also earn bonus gold for\nkilling enemy units.',
    icon: 'gold',
  },
  {
    title: 'CAMERA CONTROLS',
    text: 'Use arrow keys or the on-screen\nbuttons to scroll across the\nbattlefield.',
    icon: 'camera',
  },
  {
    title: 'ABILITIES SHOP',
    text: 'Click the Shop button to buy\nspecial abilities and upgrades\nusing your gold.',
    icon: 'shop',
  },
];

export class TutorialScene extends Phaser.Scene {
  constructor() {
    super('TutorialScene');
  }

  create() {
    this.step = 0;
    this.elements = [];
    this.showStep();
  }

  showStep() {
    // Clear previous elements
    this.elements.forEach((el) => el.destroy());
    this.elements = [];

    const cx = 512;
    const cy = 288;
    const data = STEPS[this.step];

    // Dimmed background
    const bg = this.add.rectangle(cx, cy, 1024, 576, 0x111122, 1);
    this.elements.push(bg);

    // Step counter
    const counter = this.add.text(cx, 60, `${this.step + 1} / ${STEPS.length}`, {
      fontSize: '16px', color: '#888888',
    }).setOrigin(0.5);
    this.elements.push(counter);

    // Icon area
    this.drawIcon(cx, 170, data.icon);

    // Title
    const title = this.add.text(cx, 260, data.title, {
      fontSize: '28px', color: '#FFD700', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.elements.push(title);

    // Body text
    const body = this.add.text(cx, 330, data.text, {
      fontSize: '18px', color: '#ffffff',
      align: 'center', lineSpacing: 6,
    }).setOrigin(0.5);
    this.elements.push(body);

    // Navigation buttons
    const btnY = 460;

    if (this.step > 0) {
      const prevBg = this.add.rectangle(cx - 120, btnY, 120, 44, 0x444444, 0.9)
        .setInteractive({ useHandCursor: true });
      const prevText = this.add.text(cx - 120, btnY, 'Back', {
        fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
      prevBg.on('pointerdown', () => { this.step--; this.showStep(); });
      this.elements.push(prevBg, prevText);
    }

    if (this.step < STEPS.length - 1) {
      const nextBg = this.add.rectangle(cx + 120, btnY, 120, 44, 0x228822, 0.9)
        .setInteractive({ useHandCursor: true });
      const nextText = this.add.text(cx + 120, btnY, 'Next', {
        fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
      nextBg.on('pointerdown', () => { this.step++; this.showStep(); });
      this.elements.push(nextBg, nextText);
    } else {
      const playBg = this.add.rectangle(cx + 120, btnY, 140, 44, 0x228822, 0.9)
        .setInteractive({ useHandCursor: true });
      const playText = this.add.text(cx + 120, btnY, 'Got it!', {
        fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
      playBg.on('pointerdown', () => this.scene.start('LevelSelectScene'));
      this.elements.push(playBg, playText);
    }

    // Skip link
    const skip = this.add.text(cx, 520, 'Skip tutorial', {
      fontSize: '14px', color: '#666666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    skip.on('pointerdown', () => this.scene.start('LevelSelectScene'));
    this.elements.push(skip);
  }

  drawIcon(cx, cy, type) {
    const g = this.add.graphics();
    this.elements.push(g);

    switch (type) {
      case 'base': {
        // Two bases with arrow between
        g.fillStyle(0x4444cc, 1);
        g.fillRect(cx - 100, cy - 30, 40, 60);
        g.fillStyle(0xcc4444, 1);
        g.fillRect(cx + 60, cy - 30, 40, 60);
        // Arrow
        g.lineStyle(3, 0xffffff, 0.8);
        g.beginPath();
        g.moveTo(cx - 40, cy);
        g.lineTo(cx + 40, cy);
        g.strokePath();
        // Arrowhead
        g.fillStyle(0xffffff, 0.8);
        g.fillTriangle(cx + 40, cy - 8, cx + 40, cy + 8, cx + 52, cy);
        // Explosion on enemy base
        g.fillStyle(0xffaa00, 0.7);
        g.fillCircle(cx + 80, cy - 20, 10);
        g.fillStyle(0xff4444, 0.5);
        g.fillCircle(cx + 75, cy - 15, 6);
        break;
      }
      case 'units': {
        // Four stickmen in a row
        [-60, -20, 20, 60].forEach((ox, i) => {
          const colors = [0x33cc33, 0x3399ff, 0xff8800, 0x9933ff];
          const heights = [28, 36, 40, 48];
          const color = colors[i];
          const h = heights[i];
          const x = cx + ox;
          const baseY = cy + 24;
          // Head
          g.fillStyle(color, 1);
          g.fillCircle(x, baseY - h, 5);
          // Body
          g.lineStyle(2, color, 1);
          g.beginPath();
          g.moveTo(x, baseY - h + 5);
          g.lineTo(x, baseY - 10);
          g.strokePath();
          // Legs
          g.beginPath();
          g.moveTo(x - 6, baseY);
          g.lineTo(x, baseY - 10);
          g.lineTo(x + 6, baseY);
          g.strokePath();
        });
        break;
      }
      case 'gold': {
        // Gold coin
        g.fillStyle(0xffd700, 1);
        g.fillCircle(cx, cy, 30);
        g.fillStyle(0xccaa00, 1);
        g.fillCircle(cx, cy, 24);
        g.fillStyle(0xffd700, 1);
        g.fillCircle(cx - 2, cy - 2, 22);
        const txt = this.add.text(cx, cy, 'G', {
          fontSize: '28px', color: '#8B6914', fontStyle: 'bold',
        }).setOrigin(0.5);
        this.elements.push(txt);
        // +5 text
        const plus = this.add.text(cx + 36, cy - 16, '+5/s', {
          fontSize: '16px', color: '#FFD700', fontStyle: 'bold',
        }).setOrigin(0.5);
        this.elements.push(plus);
        break;
      }
      case 'camera': {
        // Arrow keys
        const drawKey = (x, y, label) => {
          g.fillStyle(0x333333, 1);
          g.fillRoundedRect(x - 20, y - 16, 40, 32, 6);
          g.lineStyle(1, 0x666666, 1);
          g.strokeRoundedRect(x - 20, y - 16, 40, 32, 6);
          const t = this.add.text(x, y, label, {
            fontSize: '18px', color: '#ffffff',
          }).setOrigin(0.5);
          this.elements.push(t);
        };
        drawKey(cx - 30, cy, '\u25C0');
        drawKey(cx + 30, cy, '\u25B6');
        break;
      }
      case 'shop': {
        // Shop panel icon
        g.fillStyle(0x1a1a2e, 1);
        g.fillRoundedRect(cx - 50, cy - 35, 100, 70, 8);
        g.lineStyle(2, 0xffd700, 1);
        g.strokeRoundedRect(cx - 50, cy - 35, 100, 70, 8);
        const shopLabel = this.add.text(cx, cy - 15, 'SHOP', {
          fontSize: '18px', color: '#FFD700', fontStyle: 'bold',
        }).setOrigin(0.5);
        this.elements.push(shopLabel);
        // Small ability icons
        g.fillStyle(0xff4444, 1);
        g.fillRect(cx - 30, cy + 6, 12, 12);
        g.fillStyle(0x44ff44, 1);
        g.fillRect(cx - 10, cy + 6, 12, 12);
        g.fillStyle(0xff8800, 1);
        g.fillRect(cx + 10, cy + 6, 12, 12);
        g.fillStyle(0xffd700, 1);
        g.fillRect(cx + 30, cy + 6, 12, 12);
        break;
      }
    }
  }
}
