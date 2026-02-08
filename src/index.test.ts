import { afterEach, beforeEach, describe, test } from "node:test";
import { expect } from "expect";

class CountingRandom implements Crypto {
	private state: number;
	constructor(start: number) {
		this.state = start;
	}

	getRandomValues<T extends ArrayBufferView>(arr: T): T {
		const v = this.state & 0xff;
		new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength).fill(v);
		this.state++;
		return arr;
	}
	// Required by Crypto interface, but not used in tests
	get subtle(): SubtleCrypto {
		throw new Error("Not implemented");
	}
	randomUUID(): `${string}-${string}-${string}-${string}-${string}` {
		throw new Error("Not implemented");
	}
}

const originalCrypto = globalThis.crypto;
beforeEach(() => {
	Object.defineProperty(globalThis, "crypto", {
		configurable: true,
		writable: true,
		value: new CountingRandom(42),
	});
});
afterEach(() => {
	Object.defineProperty(globalThis, "crypto", {
		configurable: true,
		writable: true,
		value: originalCrypto,
	});
});

import { createTokenGenerator } from "./index.ts";

test("Instance creation smoke test", () => {
	createTokenGenerator({
		prefixWithoutUnderscore: "test",
	});
});

describe("`prefixWithoutUnderscore` validation", () => {
	test("Instance creation expect prefix", () => {
		// @ts-expect-error
		expect(() => createTokenGenerator({})).toThrow(
			new Error(
				"The `prefixWithoutUnderscore` option is required and must not be an empty string.",
			),
		);
	});

	test("prefixWithoutUnderscore: allowed characters", () => {
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "abc" }),
		).not.toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "ABC" }),
		).not.toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "aBc123" }),
		).not.toThrow();
	});

	test("prefixWithoutUnderscore: disallowed characters", () => {
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "" }),
		).toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "_" }),
		).toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "foo_bar" }),
		).toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "foo-bar" }),
		).toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "foo bar" }),
		).toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "foo!" }),
		).toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "foo@" }),
		).toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "foo#" }),
		).toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "foo$" }),
		).toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "foo%" }),
		).toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "foo/" }),
		).toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "foo." }),
		).toThrow();
		expect(() =>
			createTokenGenerator({ prefixWithoutUnderscore: "foo," }),
		).toThrow();
	});
});

test("Instance creation expect proper byte count", () => {
	expect(() =>
		createTokenGenerator({
			prefixWithoutUnderscore: "a",
			entropyBytes: -1,
		}),
	).toThrow(
		new Error(
			"The token secret byte count (`entropyBytes`) must be greater than 20.",
		),
	);

	expect(() =>
		createTokenGenerator({
			prefixWithoutUnderscore: "a",
			entropyBytes: 0,
		}),
	).toThrow(
		new Error(
			"The token secret byte count (`entropyBytes`) must be greater than 20.",
		),
	);

	expect(() =>
		createTokenGenerator({
			prefixWithoutUnderscore: "a",
			entropyBytes: 19,
		}),
	).toThrow(
		new Error(
			"The token secret byte count (`entropyBytes`) must be greater than 20.",
		),
	);

	expect(() =>
		createTokenGenerator({
			prefixWithoutUnderscore: "a",
			entropyBytes: 20,
		}),
	).toThrow(
		new Error(
			"The token secret byte count (`entropyBytes`) must be greater than 20.",
		),
	);

	createTokenGenerator({
		prefixWithoutUnderscore: "a",
		entropyBytes: 21,
	});
});

test("Roundtrip syntax check", () => {
	const g = createTokenGenerator({ prefixWithoutUnderscore: "test" });
	const token = g.generateToken();
	expect(g.isTokenString(token)).toBe(true);
});

test("Snapshot", () => {
	const g = createTokenGenerator({ prefixWithoutUnderscore: "test" });
	expect(g.generateToken()).toBe("test_W1VEkCxCAn6JoEgLqH1YRNfMDjuPSNrTQcBk");
	expect(g.generateToken()).toBe("test_WmmDcS1YbcSbzlVYAi07DGqfwLuHCp04w0yQ");
	expect(g.generateToken()).toBe("test_XY3CUh5v2RouBIKkV8yfzA1zexu8xG8jUZHI");
});

test("Non-happy paths in isTokenString", () => {
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
