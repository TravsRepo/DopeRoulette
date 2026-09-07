/** Unbiased index into a list, via rejection sampling on the crypto source. */
export function randomIndex(length: number): number {
  if (length <= 0) return 0;
  const limit = Math.floor(0xffffffff / length) * length;
  const buf = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % length;
}

/** A uniform sample of `count` distinct members, or as many as exist. */
export function sample<T>(items: T[], count: number): T[] {
  const pool = items.slice();
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    picked.push(pool.splice(randomIndex(pool.length), 1)[0]);
  }
  return picked;
}
