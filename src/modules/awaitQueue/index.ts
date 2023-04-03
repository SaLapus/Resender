export default class awaitQueue {
  private promises = new Map<number, QueueEntry>();
  private timeout?: NodeJS.Timeout;

  private _counter = 0;
  private set counter(i: number) {
    this._counter = i % 1000;
  }
  private get counter(): number {
    return this._counter;
  }

  add(): QueueEntry {
    const id = this.counter++;
    const entry = new QueueEntry();
    this.promises.set(id, entry);

    if (this.timeout) clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.promises.forEach((e) => e.done());
    }, 60_000);

    return entry;
  }

  async wait(): Promise<void> {
    if (this.promises.size === 0) await Promise.resolve();

    await Promise.allSettled([...this.promises.values()].map((e) => e.promise));
  }
}

class QueueEntry {
  promise: Promise<void>;
  private resolve!: () => void;

  constructor() {
    this.promise = new Promise((res) => (this.resolve = res));
  }

  done() {
    this.resolve();
  }
}
