<div style="text-align:center;">
  <svg data-v-ab95988f="" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="-5.45 -5.6 10.9 11.2" width="141.70000000000002" height="145.6"><polyline points="-2.250,5.0 -4.850,5.0 -4.850,-5.0 -2.250,-5.0 -2.250,-1.180 2.250,-1.180 2.250,-5.0 4.850,-5.0 4.850,5.0 2.250,5.0 2.250,1.180 -2.250,1.180 -2.250,3.180" fill="#0b4d4233" stroke="currentColor" stroke-width="0.4"></polyline><circle cx="-2.250" cy="5.0" r="0.40" fill="black"></circle><circle cx="-2.250" cy="1.180" r="0.40" fill="black"></circle><circle cx="-2.250" cy="3.180" r="0.40" fill="red"></circle></svg>
</div>

`wt-huatu`, is a Drawing Library to draw something mathematically, logically, hierarchically and programmatically.

For quick and fruitful info, please go to the official site: [https://wt-huatu.org](https://wt-huatu.org).

It is written in `Typescript`, can be used as a library, to be integrated into your project. For example, you can embed it into a customized markdown renderer to use it as some text-to-image renderer. Or it can be used as some drawing tool when using the online editor at [https://wt-huatu.org/editor](https://wt-huatu.org/editor).

Quick and intuitive explanation. It will convert some text description like this:

```yml
# --- Vars ------
vars:
  r: 100
  degAB: datan(0.25/1.25)

# --- Points ------
points:
  pA: (0, 0)

# --- Shapes ------
shapes:
  lnAB: line; pA; -degAB
cpoints:
  pB: lnAB; r

shapes2:
  cA: circle; pA; r
  cB: circle; pB; r

xpoints2:
  pC: cA; cB; n;    # Pick the northern point of the intersections
  pD: lnAB; cA; w;  # Pick the western
  pE: lnAB; cB; e;  # Pick the eastern

shapes3:
  triABC: triangle; pA; pB; pC;

# --- Draw --------
draw:
  - cA; fill, none; stroke; 1, cc
  - cB; fill, none; stroke; 1, cc
  - triABC; fill, yellow; stroke; 1, cc
  - circle; pA; 3 ||| fill; grey
  - circle; pB; 3 ||| fill; grey
  - circle; pC; 3 ||| fill; grey
  - circle; pD; 3 ||| fill; grey
  - circle; pE; 3 ||| fill; grey
  - label; at; pA; w; 20; h; 22; anchor; mr ||| $A$
  - label; at; pB; w; 20; h; 22; anchor; ml ||| $B$
  - label; at; pC; w; 20; h; 22; anchor; bm ||| $C$
  - label; at; pD; w; 20; h; 22; anchor; tr ||| $D$
  - label; at; pE; w; 20; h; 22; anchor; bl ||| $E$
```

to some SVG image like this:

<div  style="text-align:center;">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-118.05806756909202 -120.4116135138184 334.17420270727604 221.2116135138184" width="334.174" height="221.212">
<defs>
  <style type="text/css">
    foreignObject &gt; body { margin: 0; width: 100%; height: 100%; }
    .wthuatu-label-box-2b25127a { fill: none; }
    .huatu-label-container-2b25127a { width: 100%; height: 100%; padding: 0; display: flex; }
    .huatu-label-text-2b25127a { margin: auto 0; text-align: center; max-height: 100%; width: 100%; line-height: 1.0; }
  </style>
</defs>
<circle cx="0.000000" cy="0.000000" r="100.000000" fill="none" stroke="currentColor" stroke-width="1.000000"></circle>
<circle cx="98.058068" cy="-19.611614" r="100.000000" fill="none" stroke="currentColor" stroke-width="1.000000"></circle>
<path d="M0.000000,0.000000 L98.058068,-19.611614 L32.044878,-94.726584 z" fill="yellow" stroke="currentColor" stroke-width="1.000000"></path>
<circle cx="0.000000" cy="0.000000" r="3.000000" fill="grey"></circle>
<circle cx="98.058068" cy="-19.611614" r="3.000000" fill="grey"></circle>
<circle cx="32.044878" cy="-94.726584" r="3.000000" fill="grey"></circle>
<circle cx="-98.058068" cy="19.611614" r="3.000000" fill="grey"></circle>
<circle cx="196.116135" cy="-39.223227" r="3.000000" fill="grey"></circle>
<g transform="translate(-20.000000,-11.000000)">
<foreignObject x="0" y="0" width="20" height="22">
<div class="huatu-label-container-2b25127a">
<div class="huatu-label-text-2b25127a">
<span class="katex"><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">A</span></span></span></span>
</div>
</div>
</foreignObject>
</g>
<g transform="translate(0.000000,-11.000000)">
<foreignObject x="98.05806756909202" y="-19.611613513818398" width="20" height="22">
<div class="huatu-label-container-2b25127a">
<div class="huatu-label-text-2b25127a">
<span class="katex"><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.05017em;">B</span></span></span></span>
</div>
</div>
</foreignObject>
</g>
<g transform="translate(-10.000000,-22.000000)">
<foreignObject x="32.044878272377076" y="-94.72658431775389" width="20" height="22">
<div class="huatu-label-container-2b25127a">
<div class="huatu-label-text-2b25127a">
<span class="katex"><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.07153em;">C</span></span></span></span>
</div>
</div>
</foreignObject>
</g>
<g transform="translate(-20.000000,0.000000)">
<foreignObject x="-98.05806756909202" y="19.611613513818384" width="20" height="22">
<div class="huatu-label-container-2b25127a">
<div class="huatu-label-text-2b25127a">
<span class="katex"><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.02778em;">D</span></span></span></span>
</div>
</div>
</foreignObject>
</g>
<g transform="translate(0.000000,-22.000000)">
<foreignObject x="196.11613513818403" y="-39.223227027636796" width="20" height="22">
<div class="huatu-label-container-2b25127a">
<div class="huatu-label-text-2b25127a">
<span class="katex"><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.05764em;">E</span></span></span></span>
</div>
</div>
</foreignObject>
</g>
</svg>
</div>

There are some examples in the folder `examples`, which are used as the library is developed. They are simply `.yml` files, except some special syntax.

There are more examples in the shared repository at [https://wt-huatu.org/repo](https://wt-huatu.org/repo).

And there are some documents presented at [https://wt-huatu.org/doc](https://wt-huatu.org/doc). The documents are not fully covering all the features of the lib, it is a continuing process, as we add more, it will be updated.

You can use it as a npm package.

Install by

```bash
npm install wt-huatu
```

Then use it in `node.js`, or some front-end browser-like environment, following is some example (in node.js):

```typescript
import {
  WtHuatu,
  renderWtHuatuYml,
  renderYmlInput
} from "wt-huatu";

import * as fs from "fs";

// 设计输入
// The design input file
const htDesignInput = `
# Example WT-HUATU design file
# --- Vars ------
vars:
  r: 100
  degAB: datan(0.25/1.25)

# --- Points ------
points:
  pA: (0, 0)

# --- Shapes ------
shapes:
  lnAB: line; pA; -degAB
cpoints:
  pB: lnAB; r

shapes2:
  cA: circle; pA; r
  cB: circle; pB; r

xpoints2:
  pC: cA; cB; n;
  pD: lnAB; cA; w;
  pE: lnAB; cB; e;

shapes3:
  triABC: triangle; pA; pB; pC;

# --- Draw --------
draw:
  - cA; fill, none; stroke; 1, cc
  - cB; fill, none; stroke; 1, cc
  - triABC; fill, yellow; stroke; 1, cc
  - circle; pA; 2 ||| fill; grey
  - circle; pB; 2 ||| fill; grey
  - circle; pC; 2 ||| fill; grey
  - circle; pD; 2 ||| fill; grey
  - circle; pE; 2 ||| fill; grey
  - label; at; pA; w; 20; h; 22; anchor; mr ||| $A$
  - label; at; pB; w; 20; h; 22; anchor; ml ||| $B$
  - label; at; pC; w; 20; h; 22; anchor; bm ||| $C$
  - label; at; pD; w; 20; h; 22; anchor; tr ||| $D$
  - label; at; pE; w; 20; h; 22; anchor; bl ||| $E$
`;

// 用例1：直接生成嵌入svg文件的Html文件(字符串),可直接在浏览器中查看及打印。
// Usage 1: Generate the svg-image-embedded html directly, you can browse it in a browser.
const svgHtml1 = renderWtHuatuYml(htDesignInput);
fs.writeFileSync("./test-wt-huatu.html", svgHtml1);

// 用例2：编译解析后获取完全体结果
// Usage 2: Render the input to get a full-functional Object `WtHuatu`
const parsedRes = renderYmlInput(htDesignInput, {});
// WtHuatu对象, 可以查看其所有成员变量，以便于进行二次开发
// 或者选择性生成全部或部分所设计/定义的图形元素
// The parsed WtHuatu object, you can inspect all the members and call the methods, make secondary developments or intergrate into your own applications
// Or you can use this object to generate part or all the designed drawing elements ever designed
const htObj = parsedRes.huatu!;
// 从唯一的输出任务(draw)生成svg文件(字符串)，可以将此SVG文件保存为单独的文件或者嵌入到
// 其他支持SVG格式的图形处理软件中
// Output the svg file of the only job `draw`, you can save this to seperate file
// Or embed itinto other systems that can handle SVGs.
const svg1 = parsedRes.rendered.find(x => x.jobName === 'draw')!.html;
// 保存svg到文件
// Save to local SVG format image file
fs.writeFileSync("./test-wt-huatu.svg", svg1);

```

If you are interested, let's draw!
