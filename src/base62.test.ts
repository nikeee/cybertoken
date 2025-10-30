import { describe, test } from "node:test";
import { expect } from "expect";

import { decode, decodeUnsafe, encode } from "./base62.ts";

describe("base62 roundtrip", () => {
	function encodeText(value: string): Uint8Array {
		return new TextEncoder().encode(value);
	}

	describe("roundtrip", () => {
		test("empty string", () => {
			const s = encode(new Uint8Array());
			expect(s).toEqual("");
			expect(decode(s)).toEqual(new Uint8Array());
		});

		test("bytes 0..255", () => {
			const data = new Uint8Array(256);
			for (let i = 0; i < 256; ++i) {
				data[i] = i;
			}

			const s = encode(data);

			expect(s).toEqual(
				"035wZm1edb9RUsMkV3aMFxHKByy8J2aM5Kr1OxrO0hmOBbl8MqLURltuvCSdUydttr0kDH5LJyur4aKPuwfsxqZ0ALf45zQuWteH7IF5ycqRE5mYv5s3iwmE6MyKUHdhAqHAteHCSgmXkPbhxydluUJPsZdhmc8Jfpx2AkFATFLIY11c84EiU86slyiE7aaeBzQEW1rGH2yjb3RyCOFrD2Ol1CAAmSSHZ9VfBmJbqeWev8Awd6QrqF8nDpJQ7IKKxLq81bRPQzxDdy5sebVIHOCAVxlF0dnpB8oNC2rq2h7Z02P679dGKSlV8bWd13mxeGjbVg7L5nxLrZKqRzdn27z",
			);
			expect(decode(s)).toEqual(data);
		});

		test("encode simple text", () => {
			const data = encodeText("abc");
			const s = encode(data);

			expect(s).toEqual("QmIN");
			expect(decode(s)).toEqual(data);
		});

		test("encode zeros prefix", () => {
			const data = new Uint8Array([0, 0, 1, 2, 3]);
			const s = encode(data);

			expect(s).toEqual("00HBL");
			expect(decode(s)).toEqual(data);
		});
	});

	describe("parameter validation and exceptions", () => {
		test("encode rejects non-ArrayBufferView types", () => {
			expect(() => encode("not a buffer" as unknown as Uint8Array)).toThrow(
				new Error(
					"`source` has non-supported type. Provide `Uint8Array` or `ArrayBufferView`.",
				),
			);
		});

		test("encode accepts ArrayBufferView (DataView)", () => {
			const buf = new ArrayBuffer(3);
			new Uint8Array(buf).set([1, 2, 3]);

			const dv = new DataView(buf);
			const s = encode(dv);

			expect(typeof s).toBe("string");
			expect(decode(s)).toEqual(new Uint8Array([1, 2, 3]));
		});

		test("decodeUnsafe rejects non-string input", () => {
			expect(() => decodeUnsafe(123 as unknown as string)).toThrow(
				TypeError("Expected String"),
			);
		});

		test("decode/decodeUnsafe handle invalid characters", () => {
			expect(decodeUnsafe("!notbase62!")).toBeUndefined();
			expect(() => decode("!notbase62!")).toThrow(
				new Error("Failed to decode string"),
			);
		});
	});
});
