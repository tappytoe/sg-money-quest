// Run with: node tests/money.test.js
const assert = require('assert');
const { fmt, parseMoney, breakdown, sum, words } = require('../js/money.js');

assert.strictEqual(fmt(1234), '$12.34');
assert.strictEqual(fmt(5), '$0.05');
assert.strictEqual(parseMoney('12.5'), 1250);
assert.strictEqual(parseMoney('$3.05'), 305);
assert.strictEqual(parseMoney('0.29'), 29);
assert.strictEqual(parseMoney('45c'), 45);
assert.strictEqual(parseMoney('45 cents'), 45);
assert.strictEqual(parseMoney('abc'), null);
assert.strictEqual(parseMoney('1.234'), null);
assert.deepStrictEqual(breakdown(385), [200, 100, 50, 20, 10, 5]);
for (let c = 5; c <= 20000; c += 5) assert.strictEqual(sum(breakdown(c)), c, `breakdown failed for ${c}`);
assert.strictEqual(words(305), '3 dollars and 5 cents');
assert.strictEqual(words(100), '1 dollar');

console.log('All money tests passed');