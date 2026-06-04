import { describe, expect, it } from "./suite.ts";
import { createTerm } from "../term.ts";
import { close, grow, open, text } from "../ops.ts";

const decode = (b: Uint8Array) => new TextDecoder().decode(b);
const ESC = String.fromCharCode(0x1b);
const BEL = String.fromCharCode(0x07);

describe("osc8 hyperlinks", () => {
  it("emits an OSC8 hyperlink wrapper around link text", async () => {
    let term = await createTerm({ width: 40, height: 3 });
    let ansi = decode(
      term.render([
        open("root", {
          layout: { width: grow(), height: grow(), direction: "ttb" },
        }),
        text("link", { href: "https://example.com" } as never),
        close(),
      ]).output,
    );
    // OSC8 open carries the url
    expect(ansi).toContain(ESC + "]8;;https://example.com");
    // OSC8 close terminates the hyperlink
    expect(ansi).toContain(ESC + "]8;;" + BEL);
  });
});
