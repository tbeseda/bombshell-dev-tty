import { describe, expect, it } from "./suite.ts";
import { createTerm } from "../term.ts";
import { close, fit, fixed, open, text } from "../ops.ts";

describe("per-child align-self", () => {
  it("per-child alignSelf overrides parent cross-axis alignment", async () => {
    let term = await createTerm({ width: 12, height: 3 });
    let r = term.render([
      // container default cross-axis alignment (left)
      open("root2", {
        layout: { width: fixed(12), height: fixed(3), direction: "ttb" },
      }),
      // child A keeps the parent default (left)
      open("a", { layout: { width: fit(), height: fixed(1) } }),
      text("A"),
      close(),
      // child B overrides to end (right) via the proposed alignSelf field
      open("b", {
        // deno-lint-ignore no-explicit-any
        layout: { width: fit(), height: fixed(1), alignSelf: 1 } as any,
      }),
      text("B"),
      close(),
      close(),
    ]);

    // pins: A stays at the left edge under the parent default
    expect(r.info.get("a")!.bounds.x).toBe(0);
    // pins: B diverges to the right edge via its own alignSelf
    expect(r.info.get("b")!.bounds.x).toBe(11);
  });
});
