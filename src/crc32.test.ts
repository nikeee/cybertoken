import { describe, test } from "node:test";
import { expect } from "expect";

import crc32 from "./crc32.ts";

describe("crc32 smoke tests", () => {
	function encode(value: string): Uint8Array {
		return new TextEncoder().encode(value);
	}

	test("empty string", () => {
		const data = new Uint8Array();
		expect(crc32(data)).toEqual(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
	});
	test("The quick brown fox jumps over the lazy dog", () => {
		const data = encode("The quick brown fox jumps over the lazy dog");
		expect(crc32(data)).toEqual(new Uint8Array([0x41, 0x4f, 0xa3, 0x39]));
	});

	test("The quick brown fox jumps over the lazy dog.", () => {
		const data = encode("The quick brown fox jumps over the lazy dog.");
		expect(crc32(data)).toEqual(new Uint8Array([0x51, 0x90, 0x25, 0xe9]));
	});

	test("abc", () => {
		const data = encode("abc");
		expect(crc32(data)).toEqual(new Uint8Array([0x35, 0x24, 0x41, 0xc2]));
	});

	test("123456789", () => {
		const data = encode("123456789");
		expect(crc32(data)).toEqual(new Uint8Array([0xcb, 0xf4, 0x39, 0x26]));
	});

	test("a", () => {
		const data = encode("a");
		expect(crc32(data)).toEqual(new Uint8Array([0xe8, 0xb7, 0xbe, 0x43]));
	});

	test("message digest", () => {
		const data = encode("message digest");
		expect(crc32(data)).toEqual(new Uint8Array([0x20, 0x15, 0x9d, 0x7f]));
	});

	test("abcdefghijklmnopqrstuvwxyz", () => {
		const data = encode("abcdefghijklmnopqrstuvwxyz");
		expect(crc32(data)).toEqual(new Uint8Array([0x4c, 0x27, 0x50, 0xbd]));
	});

	test("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", () => {
		const data = encode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
		expect(crc32(data)).toEqual(new Uint8Array([0x1f, 0xc2, 0xe6, 0xd2]));
	});

	test("bytes 0..255", () => {
		const data = new Uint8Array(256);
		for (let i = 0; i < 256; ++i) {
			data[i] = i;
		}
		expect(crc32(data)).toEqual(new Uint8Array([0x29, 0x05, 0x8c, 0x73]));
	});
});
