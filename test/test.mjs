import { parse } from "../index.mjs";
import { test, run, assertEqual } from "./framework/index.mjs";

test("parse", t => {
  assertEqual(t, parse("no emphasis"), "no emphasis");
});

run();
