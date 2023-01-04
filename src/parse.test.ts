import { test, expect } from "vitest";

import { parseTokenData } from "./parse.js";

test("Parse token contents", () => {
  let contents;

  contents = parseTokenData("test_R67NJs98Lvg5o42CanYRTirswpki3SAsJYbNiDwHd");
  expect(contents).toBeUndefined();

  contents = parseTokenData("test_");
  expect(contents).toBeUndefined();

  contents = parseTokenData("test_abc_def");
  expect(contents).toBeUndefined();

  contents = parseTokenData(
    "test_R67NJs98Lvg5o42CanYRTirswpki3SAsJYbNiDwHdKNhiyw"
  );
  expect(contents).toEqual({
    prefixWithoutUnderscore: "test",
    actualChecksum: new Uint8Array([94, 199, 163, 74]),
    isSyntacticallyValid: true,
    secret: new Uint8Array([
      100, 166, 3, 29, 89, 224, 104, 216, 82, 241, 34, 139, 193, 245, 62, 254,
      71, 254, 26, 57, 131, 99, 11, 222, 170, 63, 150, 82, 53, 165,
    ]),
    suppliedChecksum: new Uint8Array([94, 199, 163, 74]),
    version: 0,
  });

  contents = parseTokenData(
    "randomToken_R67NJs98Lvg5o42CanYRTirswpki3SAsJYbNiDwHdKNhiyw"
  );
  expect(contents).toEqual({
    prefixWithoutUnderscore: "randomToken",
    actualChecksum: new Uint8Array([94, 199, 163, 74]),
    isSyntacticallyValid: true,
    secret: new Uint8Array([
      100, 166, 3, 29, 89, 224, 104, 216, 82, 241, 34, 139, 193, 245, 62, 254,
      71, 254, 26, 57, 131, 99, 11, 222, 170, 63, 150, 82, 53, 165,
    ]),
    suppliedChecksum: new Uint8Array([94, 199, 163, 74]),
    version: 0,
  });
});
