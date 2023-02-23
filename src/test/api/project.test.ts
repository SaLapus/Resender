import env from "dotenv";
env.config();

import { getProject } from "../../modules/api/api";

console.log = () => {
  return;
};

describe("Project Test", () => {
  test("Calling with { id: 590 }", async () => {
    expect.assertions(1);

    const project = await getProject(590);

    expect(project).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        url: expect.any(String),
        title: expect.any(String),
        shortDescription: expect.any(String),
      })
    );
  });

  test("Calling with { id: undefined }", async () => {
    expect.assertions(1);

    try {
      await getProject(undefined as unknown as number);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});
