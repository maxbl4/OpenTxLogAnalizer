export interface IStats {
  gpsSpeed: IStatTriple;
  altitude: IStatTriple;
  cumulativeAscend: IStatTriple;
  cumulativeDescend: IStatTriple;
  vSpeed: IStatTriple;
  "3dSpeed": IStatTriple;
  distanceToHome: IStatTriple;
  distanceTraveled: IStatTriple;
  sats: IStatTriple;
  pitchDeg: IStatTriple;
  throttle: IStatTriple;

  capacity: IStatTriple;
  current: IStatTriple;
  power: IStatTriple;
  rxBattery: IStatTriple;
  wattPerKm: IStatTriple;
  wattPer10Km: IStatTriple;
  estimatedRange: IStatTriple;
  estimatedFlightTime: IStatTriple;

  rss1: IStatTriple;
  rss2: IStatTriple;
  rqly: IStatTriple;
  rqlySum: IStatTriple;
  rsnr: IStatTriple;
  tpwr: IStatTriple;
  djiDelay: IStatTriple;
  djiBitrate: IStatTriple;
}

export class Stats implements IStats {
  constructor(props: IStats|undefined = undefined) {
    if (props)
      Object.assign(this, props);
  }

  altitude: IStatTriple = new StatTriple();
  cumulativeAscend: IStatTriple = new StatTriple();
  cumulativeDescend: IStatTriple = new StatTriple();
  vSpeed: IStatTriple = new StatTriple();
  "3dSpeed": IStatTriple = new StatTriple();
  capacity: IStatTriple = new StatTriple();
  current: IStatTriple = new StatTriple();
  distanceToHome: IStatTriple = new StatTriple();
  distanceTraveled: IStatTriple = new StatTriple();
  sats: IStatTriple = new StatTriple();
  throttle: IStatTriple = new StatTriple();
  pitchDeg: IStatTriple = new StatTriple();
  djiBitrate: IStatTriple = new StatTriple();
  djiDelay: IStatTriple = new StatTriple();
  estimatedFlightTime: IStatTriple = new StatTriple();
  estimatedRange: IStatTriple = new StatTriple();
  power: IStatTriple = new StatTriple();
  rqly: IStatTriple = new StatTriple();
  rqlySum: IStatTriple = new StatTriple();
  rsnr: IStatTriple = new StatTriple();
  rss1: IStatTriple = new StatTriple();
  rss2: IStatTriple = new StatTriple();
  tpwr: IStatTriple = new StatTriple();
  rxBattery: IStatTriple = new StatTriple();
  gpsSpeed: IStatTriple = new StatTriple();
  wattPer10Km: IStatTriple = new StatTriple();
  wattPerKm: IStatTriple = new StatTriple();
}

export interface IStatTriple {
  min: number;
  avg: number;
  max: number;
  minIndex: number;
  maxIndex: number;
}

export class StatTriple implements IStatTriple {
  constructor(props: IStatTriple|undefined = undefined) {
    if (props)
      Object.assign(this, props);
  }

  avg: number = 0;
  max: number = 0;
  min: number = 0;
  minIndex: number = 0;
  maxIndex: number = 0;
  get range() {
    return Math.abs(this.max - this.min);
  }
}

export const statKeys:(keyof IStats)[] = <(keyof IStats)[]>Object.keys(new Stats());
