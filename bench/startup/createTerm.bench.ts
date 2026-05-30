import { Bench } from "tinybench";
import { withCodSpeed } from "@codspeed/tinybench-plugin";
import { createTerm } from "../../term.ts";

let bench = withCodSpeed(new Bench({ name: 'startup',  }));

bench
  .add("createTerm", async () => {
    await createTerm({ width: 80, height: 24 });
  });

await bench.run();
console.table(bench.table());

