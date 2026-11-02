import { test } from "node:test";
import assert from "node:assert/strict";
import { formatAmount } from "../src/playground/amount.ts";
test("exact token display across decimal scales",()=>{
  assert.equal(formatAmount("1000001",6),"1.000001");
  assert.equal(formatAmount("1000000000000000001",18),"1.000000000000000001");
  assert.equal(formatAmount("123456789012345678901234567890",6),"123456789012345678901234.56789");
  assert.equal(formatAmount("0",18),"0");
  assert.equal(formatAmount("1",6),"0.000001");
  assert.equal(formatAmount("1000000",6),"1");
});
