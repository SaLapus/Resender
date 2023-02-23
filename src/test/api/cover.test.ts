import env from "dotenv";
env.config();

jest.setTimeout(10000);

import { getCoverStream } from "../../modules/api/api";

console.log = () => {
  return;
};

describe("Cover Test", () => {
  test("Calling with { path: '/images/8/8b/AW_v10_a.jpg' }", async () => {
    expect.assertions(1);

    const cover = await getCoverStream("/images/8/8b/AW_v10_a.jpg");

    expect(cover).toBeInstanceOf(Buffer);
  });

  test("Calling with { path: undefined }", async () => {
    expect.assertions(1);

    try {
      await getCoverStream(undefined as unknown as string);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});
