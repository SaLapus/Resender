import env from "dotenv";
env.config();

import { getUpdate } from "../../modules/api/api";

process.env.API_LOOPING = undefined;

console.log = () => {
  return;
};

describe("Update Test", () => {
  test("Get 1th update", async () => {
    expect.assertions(1);

    const update = await getUpdate(1);

    expect(update).toEqual(
      expect.objectContaining({
        title: expect.any(String),

        url: expect.any(String),
        showTime: expect.any(String),
        projectId: expect.any(Number),
        volumeId: expect.any(Number),
      })
    );
  });

  test("Get 10th update", async () => {
    expect.assertions(1);

    const update = await getUpdate(10);

    expect(update).toEqual(
      expect.objectContaining({
        title: expect.any(String),

        url: expect.any(String),
        showTime: expect.any(String),
        projectId: expect.any(Number),
        volumeId: expect.any(Number),
      })
    );
  });

  test("Get 51th update", async () => {
    expect.assertions(1);

    try {
      await getUpdate(51);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });

  test("Get update with UNDEFINED offset", async () => {
    expect.assertions(1);

    const update = await getUpdate(undefined as unknown as number);

    expect(update).toEqual(
      expect.objectContaining({
        title: expect.any(String),

        url: expect.any(String),
        showTime: expect.any(String),
        projectId: expect.any(Number),
        volumeId: expect.any(Number),
      })
    );
  });
});
