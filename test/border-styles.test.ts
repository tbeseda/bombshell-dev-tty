import { describe, expect, it } from "./suite.ts";
import { createTerm } from "../term.ts";
import { close, grow, open, type OpenElement, rgba, text } from "../ops.ts";
import { print } from "./print.ts";

const decode = (b: Uint8Array) => new TextDecoder().decode(b);
const trim = (s: string) => s.split("\n").map((l) => l.trimEnd()).join("\n");

// charset is not yet a field on the border directive; cast so this
// type-checks today while the value is ignored by the current build.
const box = (border: Record<string, unknown>) => [
  open("box", {
    layout: {
      width: grow(),
      height: grow(),
      direction: "ttb" as const,
      padding: { left: 1, top: 1 },
    },
    border: {
      color: rgba(255, 255, 255),
      left: 1,
      right: 1,
      top: 1,
      bottom: 1,
      ...border,
    } as unknown as OpenElement["border"],
  }),
  text("Content"),
  close(),
];

describe("border styles", () => {
  it("selects double-line glyphs for the 'double' named style", async () => {
    let term = await createTerm({ width: 11, height: 3 });
    let out = trim(
      print(decode(term.render(box({ charset: "double" })).output), 11, 3),
    );
    // pins: charset:"double" draws U+2554/2550/2557/2551/255A/255D, not single-line
    expect(out).toEqual(
      `
╔═════════╗
║Content  ║
╚═════════╝`.trim(),
    );
  });

  it("draws an arbitrary custom charset object verbatim", async () => {
    let term = await createTerm({ width: 11, height: 3 });
    let out = trim(
      print(
        decode(
          term.render(
            box({
              charset: {
                topLeft: "↘",
                top: "↓",
                topRight: "↙",
                right: "←",
                bottomRight: "↖",
                bottom: "↑",
                bottomLeft: "↗",
                left: "→",
              },
            }),
          ).output,
        ),
        11,
        3,
      ),
    );
    // pins: an 8-position glyph object is drawn exactly as supplied
    expect(out).toEqual(
      `
↘↓↓↓↓↓↓↓↓↓↙
→Content  ←
↗↑↑↑↑↑↑↑↑↑↖`.trim(),
    );
  });
});
