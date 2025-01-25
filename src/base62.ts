// Based on: https://github.com/cryptocoinjs/base-x (MIT licensed)
// Changes made:
// - Specialized to base62 with this alphabet
// - charAt replaced with index access (alphabet only has ascii chars)
// - BASE_MAP pre-computed for base62

// Alphabet taken from: https://en.wikipedia.org/wiki/Base62
// Important: upper case chars come before the lower case ones
export const alphabet =
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const BASE_MAP = new Uint8Array([
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 255, 255, 255, 255, 255, 255,
	255, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
	28, 29, 30, 31, 32, 33, 34, 35, 255, 255, 255, 255, 255, 255, 36, 37, 38, 39,
	40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58,
	59, 60, 61, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
]);

const BASE = alphabet.length;
const LEADER = alphabet[0];
const FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up
const iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up

export function encode(source: Uint8Array | ArrayBufferView): string {
	let src: Uint8Array;
	if (source instanceof Uint8Array) {
		src = source;
	} else if (ArrayBuffer.isView(source)) {
		src = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
	} else {
		throw new Error(
			"`source` has non-supported type. Provide `Uint8Array` or `ArrayBufferView`.",
		);
	}

	if (src.length === 0) {
		return "";
	}

	// Skip & count leading zeroes.
	let zeroes = 0;
	let length = 0;
	let pbegin = 0;
	const pend = src.length;
	while (pbegin !== pend && src[pbegin] === 0) {
		pbegin++;
		zeroes++;
	}

	// Allocate enough space in big-endian base58 representation.
	const size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
	const b58 = new Uint8Array(size);
	// Process the bytes.
	while (pbegin !== pend) {
		let carry = src[pbegin];
		// Apply "b58 = b58 * 256 + ch".
		let i = 0;
		for (
			let it1 = size - 1;
			(carry !== 0 || i < length) && it1 !== -1;
			it1--, i++
		) {
			carry += (256 * b58[it1]) >>> 0;
			b58[it1] = (carry % BASE) >>> 0;
			carry = (carry / BASE) >>> 0;
		}
		if (carry !== 0) {
			throw new Error("Non-zero carry");
		}
		length = i;
		pbegin++;
	}

	// Skip leading zeroes in base58 result.
	let it2 = size - length;
	while (it2 !== size && b58[it2] === 0) {
		it2++;
	}

	// Translate the result into a string.
	let str = LEADER.repeat(zeroes);
	for (; it2 < size; ++it2) {
		str += alphabet[b58[it2]];
	}
	return str;
}

export function decodeUnsafe(source: string): Uint8Array | undefined {
	if (typeof source !== "string") {
		throw new TypeError("Expected String");
	}

	if (source.length === 0) {
		return new Uint8Array();
	}

	let psz = 0;
	// Skip and count leading '1's.
	let zeroes = 0;
	let length = 0;
	while (source[psz] === LEADER) {
		zeroes++;
		psz++;
	}

	// Allocate enough space in big-endian base256 representation.
	const size = ((source.length - psz) * FACTOR + 1) >>> 0; // log(58) / log(256), rounded up.
	const b256 = new Uint8Array(size);
	// Process the characters.
	while (source[psz]) {
		// Decode character
		let carry = BASE_MAP[source.charCodeAt(psz)];
		// Invalid character
		if (carry === 255) {
			return undefined;
		}

		let i = 0;
		for (
			let it3 = size - 1;
			(carry !== 0 || i < length) && it3 !== -1;
			it3--, i++
		) {
			carry += (BASE * b256[it3]) >>> 0;
			b256[it3] = (carry % 256) >>> 0;
			carry = (carry / 256) >>> 0;
		}
		if (carry !== 0) {
			throw new Error("Non-zero carry");
		}

		length = i;
		psz++;
	}

	// Skip leading zeroes in b256.
	let it4 = size - length;
	while (it4 !== size && b256[it4] === 0) {
		it4++;
	}

	const vch = new Uint8Array(zeroes + (size - it4));
	let j = zeroes;
	while (it4 !== size) {
		vch[j++] = b256[it4++];
	}

	return vch;
}

export function decode(string: string): Uint8Array {
	const buffer = decodeUnsafe(string);
	if (buffer) {
		return buffer;
	}
	throw new Error("Failed to decode string");
}
