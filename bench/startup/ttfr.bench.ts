import { Bench } from "tinybench";
import { withCodSpeed } from "@codspeed/tinybench-plugin";
import { createTerm } from "../../term.ts";
import { close, grow, open, text } from "../../ops.ts";

let bench = withCodSpeed(new Bench({ name: 'startup' }));

bench
  .add("time to first render", async () => {
    let term = await createTerm({ width: 80, height: 24 });
    term.render([
        open("root", { layout: { width: grow(), height: grow(), direction: "ttb" } }),
        text("Hello, World!"),
        close(),
    ]);
  });

await bench.run();
console.table(bench.table());

