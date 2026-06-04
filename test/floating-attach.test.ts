import { describe, expect, it } from "./suite.ts";
import { createTerm } from "../term.ts";
import { close, fixed, open, text } from "../ops.ts";

// Clay attach-point enum (clay.h L433-441): LEFT_TOP=0 ... RIGHT_TOP=6.
const ATTACH_TO_PARENT = 1;
const LEFT_TOP = 0;
const RIGHT_TOP = 6;

describe("floating attach corners", () => {
  it("anchors a float to the parent's right-top corner", async () => {
    let term = await createTerm({ width: 10, height: 3 });
    // PROPOSED attachPoints: {element, parent} so the float's element corner
    // attaches to a chosen parent corner. Cast so it type-checks today; the
    // parent corner is dropped at runtime against the current build.
    let res = term.render([
      open("box", { layout: { width: fixed(5), height: fixed(3) } }),
      open("dot", {
        floating: {
          x: 0,
          y: 0,
          attachTo: ATTACH_TO_PARENT,
          attachPoints: { element: LEFT_TOP, parent: RIGHT_TOP } as never,
        },
      }),
      text("X"),
      close(),
      close(),
    ]);
    // pins: float's left edge sits at parent.x(0) + parent.width(5) = 5
    expect(res.info.get("dot")!.bounds.x).toBe(5);
  });

  it("keeps the parent corner independent of the element corner", async () => {
    let term = await createTerm({ width: 10, height: 3 });
    // element RIGHT_TOP, parent RIGHT_TOP: the float's right edge attaches to
    // the parent's right edge, so its left edge lands at parent.width - 1 = 4.
    let res = term.render([
      open("box", { layout: { width: fixed(5), height: fixed(3) } }),
      open("dot", {
        floating: {
          x: 0,
          y: 0,
          attachTo: ATTACH_TO_PARENT,
          attachPoints: { element: RIGHT_TOP, parent: RIGHT_TOP } as never,
        },
      }),
      text("X"),
      close(),
      close(),
    ]);
    // pins: element RIGHT_TOP onto parent RIGHT_TOP -> dot.x = 5 - 1 = 4
    expect(res.info.get("dot")!.bounds.x).toBe(4);
  });
});
