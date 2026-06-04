import { beforeEach, describe, expect, it } from "./suite.ts";
import { createTerm, type Term } from "../term.ts";
import { close, fit, fixed, open, percent, text } from "../ops.ts";

describe("percent min/max sizing", () => {
  let term: Term;

  beforeEach(async () => {
    term = await createTerm({ width: 20, height: 12 });
  });

  it("fit(min = percent(0.5)) grows a short child to 50% of the parent", () => {
    let r = term.render([
      open("parent", { layout: { height: fixed(12), direction: "ttb" } }),
      open("child", {
        layout: { height: fit(percent(0.5) as unknown as number) },
      }),
      text("A"),
      close(),
      close(),
    ]);
    // pins: a 1-line fit child is floored to 50% of the 12-row parent
    expect(r.info.get("child")!.bounds.height).toBe(6);
  });

  it("fit(min = percent(0.5)) is a floor, not a fixed cap", () => {
    let r = term.render([
      open("parent", { layout: { height: fixed(12), direction: "ttb" } }),
      open("child", {
        layout: { height: fit(percent(0.5) as unknown as number) },
      }),
      text("A\nA\nA\nA\nA\nA\nA\nA"),
      close(),
      close(),
    ]);
    // pins: content taller than 50% is allowed past the floor, not pinned to 6
    expect(r.info.get("child")!.bounds.height).toBe(8);
  });

  it("fit(0, max = percent(0.5)) clamps a tall child down to 50%", () => {
    let r = term.render([
      open("parent", { layout: { height: fixed(12), direction: "ttb" } }),
      open("child", {
        layout: { height: fit(0, percent(0.5) as unknown as number) },
      }),
      open("inner", { layout: { height: fixed(12) } }),
      text("A"),
      close(),
      close(),
      close(),
    ]);
    // pins: a 12-row inner is clamped down to 50% (6) of the parent
    expect(r.info.get("child")!.bounds.height).toBe(6);
  });
});
