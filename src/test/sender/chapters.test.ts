import env from "dotenv";
env.config();

import { getVolume } from "../../modules/api/api";
import Chapters from "../../modules/sender/chapters";

console.log = () => {
  return;
};

describe("Chapters Test", () => {
  test("Normal chapter", async () => {
    expect.assertions(2);

    const { chapters } = await getVolume(1261);
    const oldness = new Date("2017-11-16T00:50:00Z");

    const sortedChs = new Chapters(chapters);
    expect(sortedChs.data).toHaveLength(2);

    const filteredChs = sortedChs.filter(oldness.getTime());
    expect(filteredChs).toHaveLength(1);
  });

  test("Without chapters", () => {
    const oldness = new Date("2017-11-16T00:50:00Z");

    const sortedChs = new Chapters(undefined);
    expect(sortedChs.data).toHaveLength(0);

    const filteredChs = sortedChs.filter(oldness.getTime());
    expect(filteredChs).toHaveLength(0);
  });

  test("Without date", async () => {
    expect.assertions(2);

    const { chapters } = await getVolume(1261);
    const sortedChs = new Chapters(chapters);
    expect(sortedChs.data).toHaveLength(2);

    const filteredChs = sortedChs.filter(undefined);
    expect(filteredChs).toHaveLength(1);
  });
});
