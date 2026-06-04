import { describe, expect, it } from "./suite.ts";
import { createTerm } from "../term.ts";
import { close, fit, fixed, open, type OpenElement, text } from "../ops.ts";
import { print } from "./print.ts";

const decode = (b: Uint8Array) => new TextDecoder().decode(b);
const trim = (s: string) => s.split("\n").map((l) => l.trimEnd()).join("\n");

// flexWrap/alignContent are not layout keys yet; this shim lets the file
// type-check today. The extra keys are dropped by pack(), so they are inert
// at runtime against the current build.
const layout = (l: Record<string, unknown>): OpenElement["layout"] =>
  l as unknown as OpenElement["layout"];

describe("alignContent", () => {
  it("alignContent flex-end pushes flex lines to the cross-axis end", async () => {
    // 4 single-cell children in a 2-wide x 6-tall wrap container => 2 lines.
    let term = await createTerm({ width: 4, height: 6 });
    let res = term.render([
      open("root", {
        layout: layout({
          width: fixed(2),
          height: fixed(6),
          direction: "ltr",
          flexWrap: "wrap",
          alignContent: "flex-end",
        }),
      }),
      ...["A", "B", "C", "D"].flatMap((ch) => [
        open(ch.toLowerCase(), { layout: { width: fit(), height: fit() } }),
        text(ch),
        close(),
      ]),
      close(),
    ]);
    // pins: 2 free cross-axis rows pushed above; the two lines land on rows 4-5.
    expect(trim(print(decode(res.output), 4, 6))).toBe("\n\n\n\nAB\nCD");
  });
});
