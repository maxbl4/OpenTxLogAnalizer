export interface IStats {
  gpsSpeed: IStatTriple;
  altitude: IStatTriple;
  distanceToHome: IStatTriple;
  distanceTraveled: IStatTriple;

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
  djiDelay: IStatTriple;
  djiBitrate: IStatTriple;
}

export class Stats implements IStats {
  constructor(props: IStats|undefined = undefined) {
    if (props)
      Object.assign(this, props);
  }

  altitude: IStatTriple = new StatTriple();
  current: IStatTriple = new StatTriple();
  distanceToHome: IStatTriple = new StatTriple();
  distanceTraveled: IStatTriple = new StatTriple();
  djiBitrate: IStatTriple = new StatTriple();
  djiDelay: IStatTriple = new StatTriple();
  estimatedFlightTime: IStatTriple = new StatTriple();
  estimatedRange: IStatTriple = new StatTriple();
  power: IStatTriple = new StatTriple();
  rqly: IStatTriple = new StatTriple();
  rss1: IStatTriple = new StatTriple();
  rss2: IStatTriple = new StatTriple();
  rxBattery: IStatTriple = new StatTriple();
  gpsSpeed: IStatTriple = new StatTriple();
  wattPer10Km: IStatTriple = new StatTriple();
  wattPerKm: IStatTriple = new StatTriple();
}

export interface IStatTriple {
  min: number;
  avg: number;
  max: number;
}

export class StatTriple implements IStatTriple {
  constructor(props: IStatTriple|undefined = undefined) {
    if (props)
      Object.assign(this, props);
  }

  avg: number = 0;
  max: number = 0;
  min: number = 0;
}

export const statKeys:(keyof IStats)[] = <(keyof IStats)[]>Object.keys(new Stats());
