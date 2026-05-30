import { Bench } from "tinybench";
import { withCodSpeed } from "@codspeed/tinybench-plugin";
import { spawnFixture } from "./fixtures/utils.ts";

let bench = withCodSpeed(new Bench({ name: "startup" }));

bench
  .add("createTerm", async () => {
    spawnFixture("create-term");
  })
  .add("time to first render", async () => {
    spawnFixture("render-minimal");
  });

await bench.run();
console.table(bench.table());
