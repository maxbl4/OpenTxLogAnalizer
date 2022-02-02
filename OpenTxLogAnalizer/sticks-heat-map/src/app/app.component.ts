import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
      <canvas id="tutorial" width="1000" height="500"></canvas>
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
  private canvas: any;
  private ctx?: CanvasRenderingContext2D;

  constructor() {
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

  loop() {
    if (!this.gamepad || !this.ctx) return;
    const gp = navigator.getGamepads()[this.gamepad.index];
    if (!gp) return;
    this.axes = [...gp.axes];
    for (let i = 0; i < this.axes.length; i++) {
      this.axes[i] = Math.round(this.axes[i] * 500 + 1500);
    }
    this.roll = this.axes[0];
    this.pitch = this.axes[1];
    this.throttle = this.axes[2];
    this.yaw = this.axes[3];

    this.ctx.clearRect(0, 0, 1000, 500);
    this.ctx.fillStyle = 'rgb(200, 0, 0)';
    this.ctx.strokeStyle = 'rgb(200, 0, 0)';
    this.ctx.strokeRect(0, 0, 1000, 500);
    this.ctx.strokeRect(0, 0, 500, 500);
    this.ctx.beginPath();
    this.ctx.ellipse((this.yaw - 1000)/2, 500 - (this.throttle - 1000)/2, 10, 10, 0, 0, 360);
    this.ctx.ellipse((this.roll - 1000)/2 + 500, 500 - (this.pitch - 1000)/2, 10, 10, 0, 0, 360);
    this.ctx.fill();
    requestAnimationFrame(() => this.loop());
  }

  ngOnInit(): void {
    this.canvas = document.getElementById('tutorial');
    this.ctx = this.canvas.getContext('2d');
  }
}
