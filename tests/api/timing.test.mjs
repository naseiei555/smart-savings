import test from 'node:test';
import assert from 'node:assert/strict';

test('Measure Login Response Time Difference (Timing Attack Analysis)', async () => {
  const SAMPLES = 5;
  const timingsNonExistent = [];
  const timingsWrongPass = [];

  // 1. Measure nonexistent user login response times
  for (let i = 0; i < SAMPLES; i++) {
    const t0 = performance.now();
    await fetch('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `no_user_${Date.now()}_${i}@example.com`, password: 'TestPassword123!' })
    });
    timingsNonExistent.push(performance.now() - t0);
  }

  // 2. Measure wrong password login response times (using registered somchai@example.com)
  for (let i = 0; i < SAMPLES; i++) {
    const t0 = performance.now();
    await fetch('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'somchai@example.com', password: `WrongPassword_${i}!` })
    });
    timingsWrongPass.push(performance.now() - t0);
  }

  const avgNonExistent = (timingsNonExistent.reduce((a, b) => a + b, 0) / SAMPLES).toFixed(2);
  const avgWrongPass = (timingsWrongPass.reduce((a, b) => a + b, 0) / SAMPLES).toFixed(2);

  console.log(`Average Response Time (Non-existent user with dummyHash): ${avgNonExistent} ms`);
  console.log(`Average Response Time (Wrong password on existing user):   ${avgWrongPass} ms`);
  assert.ok(Number(avgNonExistent) > 0);
  assert.ok(Number(avgWrongPass) > 0);
});
