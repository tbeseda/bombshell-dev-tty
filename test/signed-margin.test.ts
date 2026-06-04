import { describe, expect, it } from "./suite.ts";
import { createTerm } from "../term.ts";
import { close, fixed, grow, open, type OpenElement, text } from "../ops.ts";

import { print } from "./print.ts";

const decode = (b: Uint8Array) => new TextDecoder().decode(b);

// Proposed (not-yet-implemented) signed offset prop. Cast through this so the
// ops still type-check while `margin` is silently ignored by the current build.
type Margin = { left?: number; right?: number; top?: number; bottom?: number };
const withMargin = (
  layout: NonNullable<OpenElement["layout"]>,
  margin: Margin,
): NonNullable<OpenElement["layout"]> =>
  ({ ...layout, margin }) as NonNullable<OpenElement["layout"]>;

describe("layout margin (signed offset)", () => {
  it("positive marginLeft shifts the box origin without shrinking content", async () => {
    let term = await createTerm({ width: 20, height: 4 });
    let r = term.render([
      open("root", {
        layout: { width: grow(), height: grow(), direction: "ttb" },
      }),
      open("box", {
        layout: withMargin({ width: fixed(8), direction: "ttb" }, { left: 2 }),
      }),
      text("Hello W"),
      close(),
      close(),
    ]);
    // pins: box origin moves right by 2 cells (margin offsets position, not content)
    expect(r.info.get("box")!.bounds.x).toBe(2);
    // pins: full 7-cell text still fits on ONE line (margin must not consume width)
    expect(r.info.get("box")!.bounds.height).toBe(1);
  });

  it("negative marginLeft pulls the box before the parent origin and clips", async () => {
    let term = await createTerm({ width: 20, height: 4 });
    let r = term.render([
      open("root", {
        layout: { width: fixed(6), height: grow(), direction: "ttb" },
        clip: { horizontal: true },
      }),
      open("box", {
        layout: withMargin(
          { width: fixed(12), direction: "ttb" },
          { left: -3 },
        ),
      }),
      text("Hello World"),
      close(),
      close(),
    ]);
    let first = print(decode(r.output), 20, 4).split("\n")[0];
    // pins: leftmost 3 cells fall outside the parent and are clipped away
    expect(first.slice(0, 6)).toBe("lo Wor");
  });

  it("negative margin keeps box geometry sane (no unsigned overflow)", async () => {
    let term = await createTerm({ width: 20, height: 6 });
    let r = term.render([
      open("root", {
        layout: { width: grow(), height: grow(), direction: "ttb" },
      }),
      open("box", {
        layout: withMargin(
          { width: fixed(11), direction: "ttb" },
          { left: -3 },
        ),
      }),
      text("Hello World"),
      close(),
      close(),
    ]);
    // pins: the box origin is pulled left by 3 cells (negative offset is signed)
    expect(r.info.get("box")!.bounds.x).toBe(-3);
  });
});
