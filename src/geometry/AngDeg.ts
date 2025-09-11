export class AngDeg {
  static DEG0: number = 0;
  static DEG1: number = Math.PI / 180;
  static DEG2: number = Math.PI / 90;
  static DEG3: number = Math.PI / 60;
  static DEG5: number = Math.PI / 36;
  static DEG8: number = Math.PI * 2 / 45;
  static DEG10: number = Math.PI / 18;
  static DEG12: number = Math.PI / 15;
  static DEG15: number = Math.PI / 12;
  static DEG30: number = Math.PI / 6;
  static DEG45: number = Math.PI / 4;
  static DEG60: number = Math.PI / 3;
  static DEG90: number = Math.PI / 2;
  static DEG120: number = Math.PI * 2 / 3;
  static DEG135: number = Math.PI * 3 / 4;
  static DEG150: number = Math.PI * 5 / 6;
  static DEG180: number = Math.PI;
  static DEG210: number = Math.PI * 7 / 6;
  static DEG225: number = Math.PI * 5 / 4;
  static DEG270: number = Math.PI * 3 / 2;
  static DEG315: number = Math.PI * 7 / 4;
  static DEG360: number = Math.PI * 2;


  static ang2Deg(ang: number): number{
    return ang * 180 / Math.PI;
  }

  static deg2Ang(deg: number): number{
    return deg * Math.PI / 180;
  }

  // Move The ang to range of [0, 360), and convert to Angle form
  static fitDeg(deg: number): number{
    while (deg >= 360){
      deg -= 360;
    }
    while (deg < 0){
      deg += 360;
    }
    return AngDeg.deg2Ang(deg);
  }

  static fitAng(ang: number): number {
    while (ang >= AngDeg.DEG360) {
      ang -= AngDeg.DEG360;
    }
    while (ang < 0) {
      ang += AngDeg.DEG360;
    }
    return ang;
  }

  static ensureUnder90(deg: number): number {
    deg = deg > 90
      ? 90
      : deg < -90
      ? -90
      : deg;
    return AngDeg.deg2Ang(deg);
  }

  static absAng(ang1: number, ang2: number): number {
    let ang = AngDeg.fitAng(ang1 - ang2);
    if (ang > AngDeg.DEG180) {
      ang = AngDeg.fitAng(AngDeg.DEG360 - ang);
    }
    return ang;
  }

  static isFromToCw(angFrom: number, angTo: number): boolean {
    let angDiff = AngDeg.fitAng(angTo - angFrom);
    return angDiff <= AngDeg.DEG180;
  }

}
