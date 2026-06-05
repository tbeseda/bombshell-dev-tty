import { describe, expect, it } from "./suite.ts";
import { createTerm } from "../term.ts";
import { close, fixed, open, text } from "../ops.ts";
import { print } from "./print.ts";

const decode = (b: Uint8Array) => new TextDecoder().decode(b);

describe("translate", () => {
  it("shifts the element visually but keeps its flow slot", async () => {
    let term = await createTerm({ width: 5, height: 1 });
    // PROPOSED layout.translate: a post-layout visual shift that does NOT remove
    // the element from flow (CSS translate). Cast so it type-checks today; the
    // field is dropped at runtime against the current build.
    let res = term.render([
      open("row", { layout: { width: fixed(5), direction: "ltr" } }),
      open("a", { layout: { translate: { x: 2, y: 0 } } as never }),
      text("A"),
      close(),
      text("B"),
      close(),
    ]);
    // pins: "a" reserves its flow slot at x=0, then renders shifted +2 -> x=2
    expect(res.info.get("a")!.bounds.x).toBe(2);
  });

  it("does not let the sibling reflow into the translated element's slot", async () => {
    let term = await createTerm({ width: 5, height: 1 });
    let res = term.render([
      open("row", { layout: { width: fixed(5), direction: "ltr" } }),
      open("a", { layout: { translate: { x: 2, y: 0 } } as never }),
      text("A"),
      close(),
      text("B"),
      close(),
    ]);
    // pins: sibling "B" stays at its flow column 1 and "A" draws at column 2,
    // so the full row reads " BA" (not "B A", which removing-from-flow produces)
    expect(print(decode(res.output), 5, 1)).toBe(" BA  ");
  });
});
