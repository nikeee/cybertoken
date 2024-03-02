import { expect, test } from "vitest";

import { createTokenGenerator } from "./index.js";

test("Instance creation smoke test", () => {
	createTokenGenerator({
		prefixWithoutUnderscore: "test",
	});
});

test("Instance creation expect prefix", () => {
	// @ts-expect-error
	expect(() => createTokenGenerator({})).toThrowError(
		"The `prefixWithoutUnderscore` option is required and must not be an empty string.",
	);
});

test("Instance creation expect proper byte count", () => {
	expect(() =>
		createTokenGenerator({
			prefixWithoutUnderscore: "a",
			entropyBytes: -1,
		}),
	).toThrowError(
		"The token secret byte count (`entropyBytes`) must be greater than 20.",
	);

	expect(() =>
		createTokenGenerator({
			prefixWithoutUnderscore: "a",
			entropyBytes: 0,
		}),
	).toThrowError(
		"The token secret byte count (`entropyBytes`) must be greater than 20.",
	);

	expect(() =>
		createTokenGenerator({
			prefixWithoutUnderscore: "a",
			entropyBytes: 19,
		}),
	).toThrowError(
		"The token secret byte count (`entropyBytes`) must be greater than 20.",
	);

	expect(() =>
		createTokenGenerator({
			prefixWithoutUnderscore: "a",
			entropyBytes: 20,
		}),
	).toThrowError(
		"The token secret byte count (`entropyBytes`) must be greater than 20.",
	);

	createTokenGenerator({
		prefixWithoutUnderscore: "a",
		entropyBytes: 21,
	});
});

test("Roundtrip syntax check", async () => {
	const g = createTokenGenerator({ prefixWithoutUnderscore: "test" });
	const token = await g.generateToken();
	expect(g.isTokenString(token)).toBe(true);
});

test("Non-happy paths in isTokenString", async () => {
	const g = createTokenGenerator({ prefixWithoutUnderscore: "test" });

	// @ts-expect-error
	expect(g.isTokenString()).toBe(false);
	expect(g.isTokenString(null)).toBe(false);
	expect(g.isTokenString(undefined)).toBe(false);
	expect(g.isTokenString("")).toBe(false);
	expect(g.isTokenString("a")).toBe(false);
	expect(g.isTokenString("a_")).toBe(false);
	expect(g.isTokenString("a_1234")).toBe(false);
	expect(g.isTokenString("test_")).toBe(false);
	expect(g.isTokenString("test_1234")).toBe(false);
	expect(g.isTokenString("test_")).toBe(false);
	expect(g.isTokenString("test_AAAABBBB")).toBe(false);
	expect(g.isTokenString("test_R67NJs98Lvg5o42CanYRTirswpki3SAsJYbN")).toBe(
		false,
	);
	expect(
		g.isTokenString("test_R67NJs98Lvg5o42CanYRTirswpki3SAsJYbNiDwHd"),
	).toBe(false);
	expect(
		g.isTokenString("test_R67NJs98Lvg5o42CanYRTirswpki3SAsJYbNiDwHdKNhiyW"),
	).toBe(false);
	expect(
		g.isTokenString("test_R67NJs98Lvg5o42CanYRTirswpki3SAsJYbNiDwHdKNhiyw"),
	).toBe(true);
});
