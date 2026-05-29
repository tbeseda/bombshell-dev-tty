import { Bench } from "tinybench";
import { withCodSpeed } from "@codspeed/tinybench-plugin";
import { bytes, compiled } from "../wasm.ts";
import { createTermNative } from "../term-native.ts";
import { createInputNative } from "../input-native.ts";
import { createTerm } from "../term.ts";
import { close, grow, open, text } from "../ops.ts";
import type { Op } from "../ops.ts";

const helloOps: Op[] = [
  open("root", { layout: { width: grow(), height: grow(), direction: "ttb" } }),
  text("Hello, World!"),
  close(),
];

let bench = withCodSpeed(new Bench());

bench
  .add("wasm compile", async () => {
    await WebAssembly.compile(bytes);
  })
  .add("wasm instantiate", async () => {
    const memory = new WebAssembly.Memory({ initial: 2 });
    await WebAssembly.instantiate(compiled, {
      env: { memory },
      clay: {
        measureTextFunction() {},
        queryScrollOffsetFunction(ret: number) {
          const v = new DataView(memory.buffer);
          v.setFloat32(ret, 0, true);
          v.setFloat32(ret + 4, 0, true);
        },
      },
    });
  })
  .add("createTermNative (80x24)", async () => {
    await createTermNative(80, 24);
  })
  .add("createInputNative", async () => {
    await createInputNative(50);
  })
  .add("createTerm (80x24)", async () => {
    await createTerm({ width: 80, height: 24 });
  })
  .add("startup: createTerm + first render (80x24)", async () => {
    const term = await createTerm({ width: 80, height: 24 });
    term.render(helloOps);
  });

await bench.run();
console.table(bench.table());
