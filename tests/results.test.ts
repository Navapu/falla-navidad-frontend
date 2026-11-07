import { test } from 'node:test';
import assert from 'node:assert/strict';
import { winningOptions } from '../src/results.ts';

test('identifies the winning date and dinner rather than combining meal counts', () => {
  assert.deepEqual(winningOptions([
    {date:'2026-12-18',lunch:4,dinner:8,both:2,total:8},
    {date:'2027-01-05',lunch:6,dinner:5,both:1,total:6},
  ]), [{date:'2026-12-18',meal:'dinner',votes:8}]);
});
test('returns every tied date and meal', () => {
  const options=winningOptions([
    {date:'2026-12-18',lunch:8,dinner:8,both:2,total:8},
    {date:'2027-01-05',lunch:8,dinner:5,both:1,total:8},
  ]);
  assert.equal(options.length,3);
  assert.ok(options.every(option=>option.votes===8));
});
test('never declares a winner without positive attendance', () => {
  assert.deepEqual(winningOptions([]),[]);
  assert.deepEqual(winningOptions([{date:'2026-12-18',lunch:0,dinner:0,both:0,total:0}]),[]);
});
