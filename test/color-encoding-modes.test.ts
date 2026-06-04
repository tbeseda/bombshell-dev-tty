import { describe, expect, it } from "./suite.ts";
import { createTerm } from "../term.ts";
import { close, grow, open, rgba, text } from "../ops.ts";

const decode = (b: Uint8Array) => new TextDecoder().decode(b);

describe("color encoding modes", () => {
  it("16-color mode downgrades standard red foreground to 4-bit", async () => {
    let term = await createTerm({ width: 4, height: 1 });
    let ansi = decode(
      term.render([
        open("root", { layout: { width: grow(), height: grow() } }),
        text("X", { color: rgba(255, 0, 0) }),
        close(),
        // deno-lint-ignore no-explicit-any
      ], { colorMode: "16" } as any).output,
    );

    let before = ansi.slice(0, ansi.indexOf("X"));
    // pins: standard-palette red maps to 4-bit \x1b[31m under colorMode:"16"
    expect(before).toContain("\x1b[31m");
    // pins: the 24-bit sequence must not survive the downgrade
    expect(before).not.toContain("\x1b[38;2;255;0;0");
  });

  it("256-color mode downgrades standard red foreground to a palette index", async () => {
    let term = await createTerm({ width: 4, height: 1 });
    let ansi = decode(
      term.render([
        open("root", { layout: { width: grow(), height: grow() } }),
        text("X", { color: rgba(255, 0, 0) }),
        close(),
        // deno-lint-ignore no-explicit-any
      ], { colorMode: "256" } as any).output,
    );

    let before = ansi.slice(0, ansi.indexOf("X"));
    // pins: standard-palette red maps to index 1 (\x1b[38;5;1m) under colorMode:"256"
    expect(before).toContain("\x1b[38;5;1m");
  });
});
