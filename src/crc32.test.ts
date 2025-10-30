import { describe, test } from "node:test";
import { expect } from "expect";

import crc32 from "./crc32.ts";

describe("crc32 smoke tests", () => {
	test("empty string", () => {
		const data = new Uint8Array();
		expect(crc32(data)).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
	});
	test("sample", () => {
		const data = new TextEncoder().encode(
			"The quick brown fox jumps over the lazy dog",
		);
		expect(crc32(data)).toEqual(new Uint8Array([0x41, 0x4f, 0xa3, 0x39]));
	});
});
