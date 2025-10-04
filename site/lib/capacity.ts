export function hasCapacity(used: number, persons: number, capacity: number) {
  return used + persons <= capacity;
}
