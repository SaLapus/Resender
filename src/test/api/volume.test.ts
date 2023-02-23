import env from "dotenv";
env.config();

import { getVolume } from "../../modules/api/api";

console.log = () => {
  return;
};

describe("Volume Test", () => {
  test("Calling with { id: 111 }", async () => {
    expect.assertions(11);

    const project = await getVolume(111);

    expect(project.id).toEqual(expect.any(Number));
    expect(project.url).toEqual(expect.any(String));
    expect(project.fullUrl).toEqual(expect.any(String));
    expect(project.type).toEqual(expect.any(String));
    expect(project.title).toEqual(expect.any(String));

    expect(project.shortName).toEqual(expect.any(String));
    expect(project.status).toEqual(expect.any(String));

    expect(project.covers).toEqual(
      expect.arrayContaining([expect.objectContaining({ url: expect.any(String) })])
    );
    expect(project.annotation).toEqual(expect.objectContaining({ text: expect.any(String) }));
    expect(project.staff).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nickname: expect.any(String),
          activityName: expect.any(String),
        }),
      ])
    );

    expect(project.chapters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: expect.any(String),
          id: expect.any(Number),
          volumeId: expect.any(Number),
          publishDate: expect.any(String),
        }),
      ])
    );
  });

  test("Calling with { id: undefined }", async () => {
    expect.assertions(1);

    try {
      await getVolume(undefined as unknown as number);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});
