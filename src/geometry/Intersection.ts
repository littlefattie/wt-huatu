
import type {
  IPoint,
  ILineSeg,
  ILine,
  IEllipse,
  IEllipticalArc,
  IGeometryModel,
  ISegmentModel
} from './IGeometry.js';

import type {
  IterateCalcResult,
  IEllipseTouchingPoint,
} from './Ellipse.js';

import { solveCubic, solveQuadratic } from '../math/solve-equation.js';

import { AngDeg } from './AngDeg.js';
import { WtMath } from '../math/WtMath.js';

import Point from './Point.js';
import Line from './Line.js';
import LineSeg from './LineSeg.js';
import Vector from './Vector.js';
import Circle from './Circle.js';
import Polygon from './Polygon.js';
import Ellipse from './Ellipse.js';
import { EllipticalArc } from './EllipticalArc.js';
import Rect from './Rect.js';
import { Bezier2, Bezier3 } from './Bezier.js';
import { SegmentModel } from './SegmentModel.js';
import Triangle from './Triangle.js';
import PolyLine from './PolyLine.js';
import Ring from './Ring.js';

export class Intersection {

  /**
   * Implement the process to pick the wanted point from a set of intersection points.
   * It is used in the scenario that when there are some intersection points are calculated
   * out, and we only want to specify one, so we give some condition, e.g. "east", "northwest",
   * number 1, etc. to filter the specified one out.
   * Please be aware that, when there is only one point given, it will be returned, no filtering
   * operation wil be done.
   * @param xps The intersection points calculated by some of the functions
   * @param locCondition How to pick the point wanted, direction, or index
   * @returns The picked Point
   */
  static pickPoint(xPoints: IPoint[], locCondition?: string): Point | undefined {
    if (xPoints.length < 1) return undefined;
    // Copy the points
    const xps = xPoints.map(p => new Point(p.x, p.y));
    const pCount = xps.length;
    if (pCount === 1 || !locCondition) return xps[0];
    // Check if Condition is a number
    let idx = parseInt(locCondition);
    // If condition is number
    if (!Number.isNaN(idx)) {
      idx = idx < 0
        ? 0
        : idx >= pCount
        ? pCount - 1
        : idx;
      return xps[idx];
    }
    // if condition is location/direction
    const cond = locCondition.toLowerCase();
    if (cond === "n") return xps.sort((p1, p2) => p1.y - p2.y)[0]; // North
    if (cond === "s") return xps.sort((p1, p2) => p2.y - p1.y)[0]; // South
    if (cond === "e") return xps.sort((p1, p2) => p2.x - p1.x)[0]; // East
    if (cond === "w") return xps.sort((p1, p2) => p1.x - p2.x)[0];  // West
    if (cond === "nw" || cond === "wn") return xps.sort((p1, p2) => (p1.y - p2.y) + (p1.x - p2.x))[0];  // NorthWest
    if (cond === "ne" || cond === "en") return xps.sort((p1, p2) => (p1.y - p2.y) + (p2.x - p1.x))[0];  // NorthEast
    if (cond === "sw" || cond === "ws") return xps.sort((p1, p2) => (p2.y - p1.y) + (p1.x - p2.x))[0];  // SouthWest
    if (cond === "se" || cond === "es") return xps.sort((p1, p2) => (p2.y - p1.y) + (p2.x - p1.x))[0];  // SouthEast
    let sortForMiddle;
    if (cond === "xmiddle") {  // The Point with X in the middle
      sortForMiddle = xps.sort((p1, p2) => p1.x - p2.x);   // X Ascending sort
    }
    if (cond === "ymiddle") {  // The Point with Y in the middle
      sortForMiddle = xps.sort((p1, p2) => p1.y - p2.y);   // Y Ascending sort
    }
    if (cond === "xymiddle" || cond === "center") {  // The Point with both X and Y in the middle
      sortForMiddle = xps.sort((p1, p2) => (p1.x - p2.x) + (p1.y - p2.y));
    }
    if (sortForMiddle) return (pCount % 2 === 0) ? sortForMiddle[pCount / 2 - 1] : sortForMiddle[(pCount - 1) / 2];

    // TODO: Please add more conditions if required

    // Default case, return the first point;
    return xps[0];
  }

  static line2Line(l1: Line, l2: Line): Point[] {
    const xp = Line.getXPoint(l1, l2);
    return xp ? [xp] : [];
  }

  static line2LineSeg(ln: Line, ls: LineSeg): Point[] {
    const xp = Line.getXPoint(ln, ls.toLine());
    if (!xp || !ls.isLinePointInSeg(xp)) return [];
    return [xp];
  }

  static line2MultiSegs(ln: Line, segs: LineSeg[]): Point[] {
    const xps = segs
      .map(ls => Intersection.line2LineSeg(ln, ls))
      .flat();
    // De-duplicate
    return Point.deDupPoints(xps);
  }

  static line2Circle(line: Line, circle: Circle): Point[] {
    const l2 = new Line(circle.center, AngDeg.fitDeg(line.deg + 90));
    const tp = Line.getXPoint(line, l2) as Point;
    const ls = new LineSeg(circle.center, tp);
    if (WtMath.isEqual(ls.len, circle.r)) {
      return [tp];
    } else if (ls.len > circle.r) {
      return [];
    } else {
      const alpha = Math.acos(ls.len / circle.r);
      return (WtMath.isZero(ls.len)
        ? [
          line.ang,
          AngDeg.fitAng(line.ang - AngDeg.DEG180)
        ]
        : [
          AngDeg.fitAng(ls.ang + alpha),
          AngDeg.fitAng(ls.ang - alpha)
        ])
        .map(a => circle.center.moveByLenAndAng(circle.r, a));
    }
  }

  static line2Ellipse(line: Line, ell: Ellipse): Point[] {
    const dx = (line.anchor.x - ell.cx),
          dy = (line.anchor.y - ell.cy),
          X = dx * Math.cos(ell.rot) + dy * Math.sin(ell.rot),
          Y = dy * Math.cos(ell.rot) - dx * Math.sin(ell.rot),
          beta = line.ang - ell.rot,
          a = ell.rx ** 2 * Math.sin(beta) ** 2 + ell.ry ** 2 * Math.cos(beta) ** 2,
          bBy2 = ell.rx ** 2 * Y * Math.sin(beta) + ell.ry ** 2 * X * Math.cos(beta),
          c = ell.ry ** 2 * X ** 2 + ell.rx ** 2 * Y ** 2 - ell.rx ** 2 * ell.ry ** 2,
          DeltaBy4 = bBy2 ** 2 - a * c;
    if (WtMath.isZero(DeltaBy4)) {
      return [
        line.getPointByLen(-bBy2 / a)
      ];
    } else if (DeltaBy4 > 0) {
      return [
          (-bBy2 + Math.sqrt(DeltaBy4)) / a,
          (-bBy2 - Math.sqrt(DeltaBy4)) / a
        ]
        .map(l => line.getPointByLen(l));
    } else {
      return [];
    }
  }

  static line2EllArc(line: Line, arc: EllipticalArc): Point[] {
    if (!arc.auxEllipse) return [];
    const ell = arc.auxEllipse;
    return Intersection
      .line2Ellipse(line, ell)
      .filter(xp => {
        const theta = ell.getThetaOfVector(xp);
        return theta && arc.isAngInRange(theta);
      });
  }

  static line2Bezier2(ln: Line, b2: Bezier2): Point[] {
    if (ln.isH()) {
      return b2.getIntersectionToHline(ln.anchor.y);
    }
    else if (ln.isV()) {
      return b2.getIntersectionToVline(ln.anchor.x);
    }
    else {
      const fc = (m: number[]) => [
        m[2] - 2 * m[1] + m[0],
        2 * m[1] - 2 * m[0],
        m[0]
      ];
      const mx = [b2.pStart.x, b2.ctrlPoint.x, b2.pEnd.x],
            mxC = fc(mx).map(t => t * Math.sin(ln.ang)),
            my = [b2.pStart.y, b2.ctrlPoint.y, b2.pEnd.y],
            myC = fc(my).map(t => t * Math.cos(ln.ang)),
            c2 = mxC[0] - myC[0],
            c1 = mxC[1] - myC[1],
            c0 = mxC[2] - myC[2] - ln.anchor.x * Math.sin(ln.ang) + ln.anchor.y * Math.cos(ln.ang);
      return solveQuadratic(c2, c1, c0)
        .filter(x => WtMath.isZero(x.im))
        .map(x => x.re)
        .filter(t => WtMath.isEqual(t, 0) || WtMath.isEqual(t, 1) || WtMath.isIn0and1(t))
        .map(t => b2.calcPoint(t));
    }
  }

  static line2Bezier3(ln: Line, b3: Bezier3): Point[] {
    if (ln.isH()) {
      return b3.getIntersectionToHline(ln.anchor.y);
    }
    else if (ln.isV()) {
      return b3.getIntersectionToVline(ln.anchor.x);
    }
    else {
      const fc = (m: number[]) => [
        m[3] - m[0] + 3 * m[1] - 3 * m[2],
        3 * m[0] + 3 * m[2] - 6 * m[1],
        3 * m[1] - 3 * m[0],
        m[0]
      ];
      const mx = [b3.pStart.x, b3.ctrlPoint1.x, b3.ctrlPoint2.x, b3.pEnd.x],
            mxC = fc(mx).map(t => t * Math.sin(ln.ang)),
            my = [b3.pStart.y, b3.ctrlPoint1.y, b3.ctrlPoint2.y, b3.pEnd.y],
            myC = fc(my).map(t => t * Math.cos(ln.ang)),
            c3 = mxC[0] - myC[0],
            c2 = mxC[1] - myC[1],
            c1 = mxC[2] - myC[2],
            c0 = mxC[3] - myC[3] - ln.anchor.x * Math.sin(ln.ang) + ln.anchor.y * Math.cos(ln.ang);
      return solveCubic(c3, c2, c1, c0)
        .filter(x => WtMath.isZero(x.im))
        .map(x => x.re)
        .filter(t => WtMath.isEqual(t, 0) || WtMath.isEqual(t, 1) || WtMath.isIn0and1(t))
        .map(t => b3.calcPoint(t));
    }
  }

  static line2Ring(ln: Line, ring: Ring): Point[] {
    const xps = ring.toCircles()
      .map(c => Intersection.line2Circle(ln, c))
      .flat();
      // De-duplicate
      return Point.deDupPoints(xps);
  }

  static lineSeg2LineSeg(ls1: LineSeg, ls2: LineSeg): Point[] {
    const xp = ls1.intersectionWith(ls2);
    return xp ? [xp] : [];
  }

  static lineSeg2Circle(ls: LineSeg, circle: Circle): Point[] {
    return Intersection.line2Circle(ls.toLine(), circle)
      .filter(p => ls.isLinePointInSeg(p));
  }

  static lineSeg2Ellipse(ls: LineSeg, ell: Ellipse): Point[] {
    return Intersection
      .line2Ellipse(ls.toLine(), ell)
      .filter(xp => ls.isLinePointInSeg(xp));
  }

  static lineSeg2EllArc(ls: LineSeg, arc: EllipticalArc): Point[] {
    return Intersection
      .line2EllArc(ls.toLine(), arc)
      .filter(xp => ls.isLinePointInSeg(xp));
  }
  
  static lineSeg2MultiSegs(ls: LineSeg, segs: LineSeg[]): Point[] {
    const xps = segs
      .map(s => s.intersectionWith(ls))
      .filter(p => !!p) as Point[];
    // De-duplicate
    return Point.deDupPoints(xps);
  }

  static lineSeg2Bezier2(ls: LineSeg, b2: Bezier2): Point[] {
    return Intersection.line2Bezier2(ls.toLine(), b2)
      .filter(p => ls.isLinePointInSeg(p));
  }

  static lineSeg2Bezier3(ls: LineSeg, b3: Bezier3): Point[] {
    return Intersection.line2Bezier3(ls.toLine(), b3)
      .filter(p => ls.isLinePointInSeg(p));
  }

  static lineSeg2Ring(ls: LineSeg, ring: Ring): Point[] {
    const xps = ring.toCircles()
      .map(c => Intersection.lineSeg2Circle(ls, c))
      .flat();
      // De-duplicate
      return Point.deDupPoints(xps);
  }

  static circle2Circle(c1: Circle, c2: Circle): Point[] {
    const xps = Circle.intersectionsOf(c1, c2);
    return xps ? xps : [];
  }

  static circle2Ellipse(circle: Circle, ell: Ellipse): Point[] {
    return Ellipse.getXPoints(new Ellipse(circle.cx, circle.cy, circle.r, circle.r, 0), ell);
  }

  static circle2EllArc(circle: Circle, arc: EllipticalArc): Point[] {
    if (!arc.isValid) return [];
    const auxEll = arc.auxEllipse!;
    const xps = Ellipse.getXPoints(new Ellipse(circle.cx, circle.cy, circle.r, circle.r, 0), auxEll);
    return xps.filter(p => {
      const a = auxEll.getThetaOfVector(p);
      return (a !== undefined) && arc.isAngInRange(a);
    });
  }

  static circle2MultiSegs(circle: Circle, segs: LineSeg[]): Point[] {
    const xps = segs
      .map(ls => Intersection.lineSeg2Circle(ls, circle))
      .flat();
    // De-duplicate
    return Point.deDupPoints(xps);
  }

  static circle2Ring(circ: Circle, ring: Ring): Point[] {
    const xps = ring.toCircles()
      .map(c => Intersection.circle2Circle(circ, c))
      .flat();
      // De-duplicate
      return Point.deDupPoints(xps);
  }

  static ellipse2ellipse(ell1: Ellipse, ell2: Ellipse): Point[] {
    return Ellipse.getXPoints(ell1,ell2);
  }

  static ellipse2EllArc(ell: Ellipse, arc: EllipticalArc): Point[] {
    if (!arc.isValid) return [];
    const auxEll = arc.auxEllipse!;
    const xps = Ellipse.getXPoints(ell, auxEll);
    return xps.filter(p => {
      const a = auxEll.getThetaOfVector(p);
      return (a !== undefined) && arc.isAngInRange(a);
    });
  }

  static ellipse2MultiSegs(ell: Ellipse, segs: LineSeg[]): Point[] {
    const xps = segs
      .map(ls => Intersection.lineSeg2Ellipse(ls, ell))
      .flat();
    // De-duplicate
    return Point.deDupPoints(xps);
  }
  
  static ellipse2Ring(ell: Ellipse, ring: Ring): Point[] {
    const xps = ring.toCircles()
      .map(c => Intersection.circle2Ellipse(c, ell))
      .flat();
      // De-duplicate
      return Point.deDupPoints(xps);
  }

  static ellArc2EllArc(arc1: EllipticalArc, arc2: EllipticalArc): Point[] {
    if (!arc1.auxEllipse || !arc2.auxEllipse) return [];
    const ell1 = arc1.auxEllipse;
    const ell2 = arc2.auxEllipse;
    return Ellipse
      .getXPoints(ell1, ell2)
      .filter(xp => {
        const theta1 = ell1.getThetaOfVector(xp);
        const theta2 = ell2.getThetaOfVector(xp);
        return theta1 && theta2 && arc1.isAngInRange(theta1) && arc2.isAngInRange(theta2);
      });
  }

  static ellArc2MultiSegs(arc: EllipticalArc, segs: LineSeg[]): Point[] {
    if (!arc.isValid || !arc.auxEllipse) return [];
    const auxEll = arc.auxEllipse;
    return Intersection.ellipse2MultiSegs(auxEll, segs)
      .filter(p => {
        const a = auxEll.getThetaOfVector(p);
        return (a !== undefined) && arc.isAngInRange(a);
      });
  }
  
  static ellArc2Ring(arc: EllipticalArc, ring: Ring): Point[] {
    const xps = ring.toCircles()
      .map(c => Intersection.circle2EllArc(c, arc))
      .flat();
      // De-duplicate
      return Point.deDupPoints(xps);
  }
  
  static multiSegs2MultiSegs(segs1: LineSeg[], segs2: LineSeg[]): Point[] {
    const xps = segs1
      .map(ls => Intersection.lineSeg2MultiSegs(ls, segs2))
      .flat();
      // De-duplicate
    return Point.deDupPoints(xps);
  }

  static multiSegs2Bezier2(segs: LineSeg[], b2: Bezier2): Point[] {
    const xps = segs.map(ls => Intersection.lineSeg2Bezier2(ls, b2))
      .flat();
      // De-duplicate
    return Point.deDupPoints(xps);    
  }

  static multiSegs2Bezier3(segs: LineSeg[], b3: Bezier3): Point[] {
    const xps = segs.map(ls => Intersection.lineSeg2Bezier3(ls, b3))
      .flat();
      // De-duplicate
    return Point.deDupPoints(xps);
  }
  
  static multiSegs2Ring(segs: LineSeg[], ring: Ring): Point[] {
    const xps = ring.toCircles()
      .map(c => Intersection.circle2MultiSegs(c, segs))
      .flat();
      // De-duplicate
    return Point.deDupPoints(xps);
  }

  static getModelIntersections(m1: ISegmentModel, m2: ISegmentModel) {
    const t1t2s = [
      [0,     0], [0,     0.25], [0,     0.333], [0,     0.5], [0,     0.666], [0,     0.75], [0,     1],
                  [0.25,  0.25], [0.25,  0.333], [0.25,  0.5], [0.25,  0.666], [0.25,  0.75], [0.25,  1],
                                 [0.333, 0.333], [0.333, 0.5], [0.333, 0.666], [0.333, 0.75], [0.333, 1],
                                                 [0.5,   0.5], [0.5,   0.666], [0.5,   0.75], [0.5,   1],
                                                               [0.666, 0.666], [0.666, 0.75], [0.666, 1],
                                                                               [0.75,  0.75], [0.75,  1],
                                                                                              [1,     1]
    ];
    
    const xps: Point[] = [];
    for (let i = 0; i < t1t2s.length; i++) {
      let xp = SegmentModel.getIntersection(m1, t1t2s[i][0], m2, t1t2s[i][1], xps);
      if (xp) {
        xps.push(new Point(xp.px, xp.py));
      }
    }
    
    return Point.deDupPoints(xps, 3e-3);
  }

  static circle2Bezier(circ: Circle, bz: Bezier2 | Bezier3): Point[] {
    const pts = [
      EllipticalArc.fromCircle(circ,   0,  90, true),
      EllipticalArc.fromCircle(circ,  90, 180, true),
      EllipticalArc.fromCircle(circ, 180, 270, true),
      EllipticalArc.fromCircle(circ, 270, 360, true)
    ]
    .map(a => Intersection.getModelIntersections(a, bz))
    .flat();
    return Point.deDupPoints(pts, 3e-3);
  }
  
  static ellipse2Bezier(ell: Ellipse, bz: Bezier2 | Bezier3): Point[] {
    const pts = [
      EllipticalArc.fromEllipse(ell,   0,  90, true),
      EllipticalArc.fromEllipse(ell,  90, 180, true),
      EllipticalArc.fromEllipse(ell, 180, 270, true),
      EllipticalArc.fromEllipse(ell, 270, 360, true)
    ]
    .map(a => Intersection.getModelIntersections(a, bz))
    .flat();
    return Point.deDupPoints(pts, 3e-3);
  }
  
  static ring2Bezier(ring: Ring, bz: Bezier2 | Bezier3): Point[] {
    const xps = ring.toCircles()
      .map(c => Intersection.circle2Bezier(c, bz))
      .flat();
      // De-duplicate
    return Point.deDupPoints(xps);
  }

  static ring2ring(ring1: Ring, ring2: Ring): Point[] {
    const xps = ring1.toCircles()
      .map(c => Intersection.circle2Ring(c, ring2))
      .flat();
      // De-duplicate
    return Point.deDupPoints(xps);
  }

  static getXPoint(model1?: IGeometryModel, model2?: IGeometryModel, locCondition?: string): Point | undefined {
    if (!model1 || !model2) return undefined;
    const xps = Intersection.getXpoints(model1, model2);
    if (xps.length < 1) return undefined;
    return Intersection.pickPoint(xps, locCondition);
  }

  static getXpoints(model1: IGeometryModel, model2: IGeometryModel): Point[] {
    const getModelType = (model: IGeometryModel) => {
      if (model instanceof Line) return "line";
      if (model instanceof LineSeg) return "lineseg";
      if (model instanceof Circle) return "circle";
      if (model instanceof Ellipse) return "ellipse";
      if (model instanceof Triangle) return "multsegs";
      if (model instanceof Rect) return "multsegs";
      if (model instanceof PolyLine) return "multsegs";
      if (model instanceof Polygon) return "multsegs";
      if (model instanceof EllipticalArc) return "arc";
      if (model instanceof Bezier2) return "b2";
      if (model instanceof Bezier3) return "b3";
      if (model instanceof Ring) return "ring";
      return undefined;
    }

    const makePolygonLineSegs = (model: IGeometryModel) => {
      return (model as (Triangle | Rect | PolyLine | Polygon)).toLineSegs();
    }

    const mt1 = getModelType(model1),
          mt2 = getModelType(model2);
    if ((mt1 === "line" && mt2 === "line")) return Intersection.line2Line(model1 as Line, model2 as Line);
    if ((mt1 === "line" && mt2 === "lineseg")) return Intersection.line2LineSeg(model1 as Line, model2 as LineSeg);
    if ((mt2 === "line" && mt1 === "lineseg")) return Intersection.line2LineSeg(model2 as Line, model1 as LineSeg);
    if ((mt1 === "line" && mt2 === "circle")) return Intersection.line2Circle(model1 as Line, model2 as Circle);
    if ((mt2 === "line" && mt1 === "circle")) return Intersection.line2Circle(model2 as Line, model1 as Circle);
    if ((mt1 === "line" && mt2 === "ellipse")) return Intersection.line2Ellipse(model1 as Line, model2 as Ellipse);
    if ((mt2 === "line" && mt1 === "ellipse")) return Intersection.line2Ellipse(model2 as Line, model1 as Ellipse);
    if ((mt1 === "line" && mt2 === "arc")) return Intersection.line2EllArc(model1 as Line, model2 as EllipticalArc);
    if ((mt2 === "line" && mt1 === "arc")) return Intersection.line2EllArc(model2 as Line, model1 as EllipticalArc);
    if ((mt1 === "line" && mt2 === "multsegs")) return Intersection.line2MultiSegs(model1 as Line, makePolygonLineSegs(model2));
    if ((mt2 === "line" && mt1 === "multsegs")) return Intersection.line2MultiSegs(model2 as Line, makePolygonLineSegs(model1));
    if ((mt1 === "line" && mt2 === "b2")) return Intersection.line2Bezier2(model1 as Line, model2 as Bezier2);
    if ((mt2 === "line" && mt1 === "b2")) return Intersection.line2Bezier2(model2 as Line, model1 as Bezier2);
    if ((mt1 === "line" && mt2 === "b3")) return Intersection.line2Bezier3(model1 as Line, model2 as Bezier3);
    if ((mt2 === "line" && mt1 === "b3")) return Intersection.line2Bezier3(model2 as Line, model1 as Bezier3);
    if ((mt1 === "line" && mt2 === "ring")) return Intersection.line2Ring(model1 as Line, model2 as Ring);
    if ((mt2 === "line" && mt1 === "ring")) return Intersection.line2Ring(model2 as Line, model1 as Ring);

    if ((mt1 === "lineseg" && mt2 === "lineseg")) return Intersection.lineSeg2LineSeg(model1 as LineSeg, model2 as LineSeg);
    if ((mt1 === "lineseg" && mt2 === "circle")) return Intersection.lineSeg2Circle(model1 as LineSeg, model2 as Circle);
    if ((mt2 === "lineseg" && mt1 === "circle")) return Intersection.lineSeg2Circle(model2 as LineSeg, model1 as Circle);
    if ((mt1 === "lineseg" && mt2 === "ellipse")) return Intersection.lineSeg2Ellipse(model1 as LineSeg, model2 as Ellipse);
    if ((mt2 === "lineseg" && mt1 === "ellipse")) return Intersection.lineSeg2Ellipse(model2 as LineSeg, model1 as Ellipse);
    if ((mt1 === "lineseg" && mt2 === "arc")) return Intersection.lineSeg2EllArc(model1 as LineSeg, model2 as EllipticalArc);
    if ((mt2 === "lineseg" && mt1 === "arc")) return Intersection.lineSeg2EllArc(model2 as LineSeg, model1 as EllipticalArc);    
    if ((mt1 === "lineseg" && mt2 === "multsegs")) return Intersection.lineSeg2MultiSegs(model1 as LineSeg, makePolygonLineSegs(model2));
    if ((mt2 === "lineseg" && mt1 === "multsegs")) return Intersection.lineSeg2MultiSegs(model2 as LineSeg, makePolygonLineSegs(model1));
    if ((mt1 === "lineseg" && mt2 === "b2")) return Intersection.lineSeg2Bezier2(model1 as LineSeg, model2 as Bezier2);
    if ((mt2 === "lineseg" && mt1 === "b2")) return Intersection.lineSeg2Bezier2(model2 as LineSeg, model1 as Bezier2);
    if ((mt1 === "lineseg" && mt2 === "b3")) return Intersection.lineSeg2Bezier3(model1 as LineSeg, model2 as Bezier3);
    if ((mt2 === "lineseg" && mt1 === "b3")) return Intersection.lineSeg2Bezier3(model2 as LineSeg, model1 as Bezier3);
    if ((mt1 === "lineseg" && mt2 === "ring")) return Intersection.lineSeg2Ring(model1 as LineSeg, model2 as Ring);
    if ((mt2 === "lineseg" && mt1 === "ring")) return Intersection.lineSeg2Ring(model2 as LineSeg, model1 as Ring);

    if ((mt1 === "circle" && mt2 === "circle")) return Intersection.circle2Circle(model1 as Circle, model2 as Circle);
    if ((mt1 === "circle" && mt2 === "ellipse")) return Intersection.circle2Ellipse(model1 as Circle, model2 as Ellipse);
    if ((mt2 === "circle" && mt1 === "ellipse")) return Intersection.circle2Ellipse(model2 as Circle, model1 as Ellipse);
    if ((mt1 === "circle" && mt2 === "arc")) return Intersection.circle2EllArc(model1 as Circle, model2 as EllipticalArc);
    if ((mt2 === "circle" && mt1 === "arc")) return Intersection.circle2EllArc(model2 as Circle, model1 as EllipticalArc);
    if ((mt1 === "circle" && mt2 === "multsegs")) return Intersection.circle2MultiSegs(model1 as Circle, makePolygonLineSegs(model2));
    if ((mt2 === "circle" && mt1 === "multsegs")) return Intersection.circle2MultiSegs(model2 as Circle, makePolygonLineSegs(model1));    
    if ( mt1 === "circle" && (mt2 === "b2" || mt2 === "b3")) {
      return Intersection.circle2Bezier(model1 as Circle, model2 as (Bezier2 | Bezier3))
    }
    if ( mt2 === "circle" && (mt1 === "b2" || mt1 === "b3")) {
      return Intersection.circle2Bezier(model2 as Circle, model1 as (Bezier2 | Bezier3))
    }
    if ((mt1 === "circle" && mt2 === "ring")) return Intersection.circle2Ring(model1 as Circle, model2 as Ring);
    if ((mt2 === "circle" && mt1 === "ring")) return Intersection.circle2Ring(model2 as Circle, model1 as Ring);

    if ((mt1 === "ellipse" && mt2 === "ellipse")) return Intersection.ellipse2ellipse(model1 as Ellipse, model2 as Ellipse);
    if ((mt1 === "ellipse" && mt2 === "arc")) return Intersection.ellipse2EllArc(model1 as Ellipse, model2 as EllipticalArc);
    if ((mt2 === "ellipse" && mt1 === "arc")) return Intersection.ellipse2EllArc(model2 as Ellipse, model1 as EllipticalArc);
    if ((mt1 === "ellipse" && mt2 === "multsegs")) return Intersection.ellipse2MultiSegs(model1 as Ellipse, makePolygonLineSegs(model2));
    if ((mt2 === "ellipse" && mt1 === "multsegs")) return Intersection.ellipse2MultiSegs(model2 as Ellipse, makePolygonLineSegs(model1));
    if ( mt1 === "ellipse" && (mt2 === "b2" || mt2 === "b3")) {
      return Intersection.ellipse2Bezier(model1 as Ellipse, model2 as (Bezier2 | Bezier3))
    }
    if ( mt2 === "ellipse" && (mt1 === "b2" || mt1 === "b3")) {
      return Intersection.ellipse2Bezier(model2 as Ellipse, model1 as (Bezier2 | Bezier3))
    }
    if ((mt1 === "ellipse" && mt2 === "ring")) return Intersection.ellipse2Ring(model1 as Ellipse, model2 as Ring);
    if ((mt2 === "ellipse" && mt1 === "ring")) return Intersection.ellipse2Ring(model2 as Ellipse, model1 as Ring);
    
    if ((mt1 === "arc" && mt2 === "arc")) return Intersection.ellArc2EllArc(model1 as EllipticalArc, model2 as EllipticalArc);
    if ((mt1 === "arc" && mt2 === "multsegs")) return Intersection.ellArc2MultiSegs(model1 as EllipticalArc, makePolygonLineSegs(model2));
    if ((mt2 === "arc" && mt1 === "multsegs")) return Intersection.ellArc2MultiSegs(model2 as EllipticalArc, makePolygonLineSegs(model1));
    if ((mt1 === "arc" && (mt2 === "b2" || mt2 === "b3")) || (mt2 === "arc" && (mt1 === "b2" || mt1 === "b3"))) {
      return Intersection.getModelIntersections(model1 as (EllipticalArc | Bezier2 | Bezier3), model2 as (EllipticalArc | Bezier2 | Bezier3))
    }
    if ((mt1 === "arc" && mt2 === "ring")) return Intersection.ellArc2Ring(model1 as EllipticalArc, model2 as Ring);
    if ((mt2 === "arc" && mt1 === "ring")) return Intersection.ellArc2Ring(model2 as EllipticalArc, model1 as Ring);

    if ((mt1 === "multsegs" && mt2 === "multsegs")) return Intersection.multiSegs2MultiSegs(makePolygonLineSegs(model1), makePolygonLineSegs(model2));
    if ((mt1 === "multsegs" && mt2 === "b2")) return Intersection.multiSegs2Bezier2(makePolygonLineSegs(model1), model2 as Bezier2);
    if ((mt2 === "multsegs" && mt1 === "b2")) return Intersection.multiSegs2Bezier2(makePolygonLineSegs(model2), model1 as Bezier2);
    if ((mt1 === "multsegs" && mt2 === "b3")) return Intersection.multiSegs2Bezier3(makePolygonLineSegs(model1), model2 as Bezier3);
    if ((mt2 === "multsegs" && mt1 === "b3")) return Intersection.multiSegs2Bezier3(makePolygonLineSegs(model2), model1 as Bezier3);
    if ((mt1 === "multsegs" && mt2 === "ring")) return Intersection.multiSegs2Ring(makePolygonLineSegs(model1), model2 as Ring);
    if ((mt2 === "multsegs" && mt1 === "ring")) return Intersection.multiSegs2Ring(makePolygonLineSegs(model2), model1 as Ring);

    if ((mt1 === "b2" || mt1 === "b3") && (mt2 === "b2" || mt2 == "b3")) {
      return Intersection.getModelIntersections(model1 as (Bezier2 | Bezier3), model2 as (Bezier2 | Bezier3));
    }
    if ( mt1 === "ring" && (mt2 === "b2" || mt2 === "b3")) {
      return Intersection.ring2Bezier(model1 as Ring, model2 as (Bezier2 | Bezier3))
    }
    if (mt2 === "ring" && (mt1 === "b2" || mt1 === "b3")) {
      return Intersection.ring2Bezier(model2 as Ring, model1 as (Bezier2 | Bezier3))
    }

    if ((mt1 === "ring" && mt2 === "ring")) return Intersection.ring2ring(model1 as Ring, model2 as Ring);
    
    // TODO: If more intersection calculations required to be implemented, please add them

    // Default case, return empty (no intersection points)
    return [];
  }

}

