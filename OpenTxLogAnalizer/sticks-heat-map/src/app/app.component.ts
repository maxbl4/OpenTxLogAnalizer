import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
      <canvas id="tutorial" [width]="width*2" [height]="height"></canvas>
      <br>
      <ng-container *ngIf="axes">
        Roll: {{roll}}<br>
        Pitch: {{pitch}}<br>
        Thr: {{throttle}}<br>
        Yaw: {{yaw}}<br>
      </ng-container>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'sticks-heat-map';
  private gamepad?: Gamepad;
  axes?: number[];
  roll: number = 0;
  pitch: number = 0;
  throttle: number = 0;
  yaw: number = 0;
  heatMap: number[] = [];
  count = 0;
  width = 50;
  height = 50;
  private canvas: any;
  private ctx?: CanvasRenderingContext2D;

  constructor() {
    this.heatMap = new Array(this.width * 2 * this.height);
    window.addEventListener("gamepadconnected", (e) => {
      this.connected(e.gamepad);
      });
    window.addEventListener("gamepaddisconnected", (e) => {
      this.gamepad = undefined;
    });
  }

  connected(gamepad: Gamepad) {
    if (gamepad.index == 0) {
      this.gamepad = gamepad;
      requestAnimationFrame(() => this.loop());
    }
  }

  maxValue = 0;

  loop() {
    if (!this.gamepad || !this.ctx) return;
    const gp = navigator.getGamepads()[this.gamepad.index];
    if (!gp) return;
    this.axes = [...gp.axes];
    for (let i = 0; i < this.axes.length; i++) {
      this.axes[i] = Math.round(this.axes[i] * 500 + 1500);
    }
    this.count++;
    this.roll = this.axes[0];
    this.pitch = this.axes[1];
    this.throttle = this.axes[2];
    this.yaw = this.axes[3];

    const leftX = Math.floor( (this.yaw - 1000)/(1000/this.width));
    const leftY = Math.floor(this.height - (this.throttle - 1000)/(1000/this.height));
    const rightX = Math.floor((this.roll - 1000)/(1000/this.width) + this.width);
    const rightY = Math.floor(this.height - (this.pitch - 1000)/(1000/this.height));
    let v = this.heatMap[leftY * this.width * 2 + leftX] = (this.heatMap[leftY * this.width * 2 + leftX] ?? 0) + 1;
    if (v > this.maxValue) this.maxValue = v;
    v = this.heatMap[rightY * this.width * 2 + rightX] = (this.heatMap[rightY * this.width * 2 + rightX] ?? 0) + 1;
    if (v > this.maxValue) this.maxValue = v;

    if (this.count % 100 == 0) {
      this.ctx.clearRect(0, 0, this.width * 2, this.height);
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width * 2; x++){
          const v = this.heatMap[y * this.width * 2 + x];
          if (v) {
            this.ctx.fillStyle = `rgb(255, ${255 - Math.round(v / this.maxValue * 255)}, ${255 - Math.round(v / this.maxValue * 255)})`;
            this.ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
    requestAnimationFrame(() => this.loop());
  }

  ngOnInit(): void {
    this.canvas = document.getElementById('tutorial');
    this.ctx = this.canvas.getContext('2d');
  }
}
