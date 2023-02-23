import { DataBase } from "../../modules/db";

const DataBaseTest = async (db: DataBase, time: Date) => {
  expect(db).toBeInstanceOf(DataBase);

  expect(db.offline).toBeTruthy();
  expect(() => db.pool).toThrow();
  expect(db.time).toEqual(time);

  const savedTime = await db.getSavedTime();
  expect(savedTime).toEqual(new Date(time));

  const relevance = await db.checkRelevance({ showTime: new Date().toISOString() });
  expect(relevance).toBeTruthy();

  const newTime = new Date();
  await db.saveTime(newTime.getTime());
  expect(await db.getSavedTime()).toEqual(newTime);
};

describe("Creating DataBase with 'string' argument", () => {
  const date = new Date();

  test(`Init with ${date.getTime()}`, async () => {
    expect.assertions(7);
    const db = new DataBase("" + date.getTime());

    await DataBaseTest(db, date);
  });

  test(`Init with ${date.toISOString()}`, async () => {
    expect.assertions(7);
    const db = new DataBase("" + date.toISOString());

    await DataBaseTest(db, date);
  });
});

describe("Creating DataBase with 'number' argument", () => {
  const date = new Date();

  test(`Init with ${date.getTime()}`, async () => {
    expect.assertions(7);
    const db = new DataBase(date.getTime());

    await DataBaseTest(db, date);
  });
});

describe("Creating DataBase with 'Date' argument", () => {
  const date = new Date();

  test(`Init with ${date}`, async () => {
    expect.assertions(7);
    const db = new DataBase(date);

    await DataBaseTest(db, date);
  });
});
