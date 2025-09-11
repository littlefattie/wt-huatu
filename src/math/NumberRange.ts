import { WtMath } from "./WtMath.js";

export interface INumberRange {
  start: number;
  step: number;
  end: number;
  numbers: number[];

  count(): number;
}

export class NumberRange implements INumberRange {
  start: number;
  step: number;
  end: number;
  numbers: number[];

  constructor(start: number, step: number, end: number) {
    this.start = start;
    this.end = end;
    if (WtMath.isZero(step) || WtMath.isEqual(this.start, this.end)) {
      this.numbers = [this.start];
      this.step = 0;
    } else {
      this.step = Math.abs(step);
      let inc = this.end > this.start;
      let x = this.start;
      this.numbers = [];
      while((inc && x < this.end) || (!inc && x > this.end)) {
        this.numbers.push(x);
        x += (inc ? this.step : -this.step);
      }
      // If the end is "very close to the range-end, then add it"
      if (( inc && x >= this.end && WtMath.isEqual(x, this.end)) ||
          (!inc && x <= this.end && WtMath.isEqual(x, this.end))) {
        this.numbers.push(this.end);
      }
    }
  }

  count(): number {
    return this.numbers.length;
  }

  static build0toN(n: number) {
    if (n <= 0) return new NumberRange(0, 0, 0);
    return new NumberRange(0, 1, Math.ceil(n));
  }

}
