import { describe, expect, it } from "./suite.ts";
import { createTerm } from "../term.ts";
import { close, fixed, open, text } from "../ops.ts";

describe("stretch sizing", () => {
  it("stretch sizing fills the container cross axis", async () => {
    let term = await createTerm({ width: 12, height: 5 });
    let r = term.render([
      open("root", {
        layout: { width: fixed(12), height: fixed(5), direction: "ttb" },
      }),
      // stretch() on the cross axis should expand the fit-content child to
      // fill the container width; cast since the sizing type is proposed.
      open("child", {
        layout: {
          // deno-lint-ignore no-explicit-any
          width: { type: "stretch" } as any,
          height: fixed(3),
        },
      }),
      text("X"),
      close(),
      close(),
    ]);

    // pins: a stretch child grows to the container's cross-axis width (12),
    // rather than the unstretched width it computes today
    expect(r.info.get("child")!.bounds.width).toBe(12);
  });
});
