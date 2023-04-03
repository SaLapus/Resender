export default class awaitQueue {
  private entries: QueueEntry[] = [];
  private timeout?: NodeJS.Timeout;

  add(): QueueEntry {
    const entry = new QueueEntry();
    this.entries.push(entry);

    if (this.timeout) clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.entries.forEach((e) => e.done());
      this.entries = [];
    }, 60_000);

    return entry;
  }

  async wait(): Promise<void> {
    if (this.entries.length === 0) await Promise.resolve();

    await Promise.allSettled(this.entries.map((e) => e.promise));
    this.entries.shift();
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
