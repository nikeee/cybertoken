import crc32 from "./crc32.js";
import { alphabet, base62, version } from "./constants.js";

// TODO: Secret scanner to search for tokens

export function getTokenPattern(prefixWithUnderscore: string): RegExp {
	return new RegExp(`^${prefixWithUnderscore}[${alphabet}]+$`);
}

export interface TokenContents {
	prefixWithoutUnderscore: string;
	secret: Uint8Array;
	version: number;
	suppliedChecksum: Uint8Array;
	actualChecksum: Uint8Array;
	isSyntacticallyValid: boolean;
}

/**
 * Only use this if you want to look at the parsed contents of the token. **Then using the tokens, this is usually not needed.** It is mostly used internally.
 *
 * You should treat the token contents as a black box.
 */
export function parseTokenData(token: string): TokenContents | undefined {
	if (!token.includes("_")) {
		return undefined;
	}

	const splitData = token.split("_");
	if (splitData.length !== 2) {
		return undefined;
	}

	const [prefix, encodedTokenData] = splitData;

	const secretWithVersionAndChecksum = base62.decode(encodedTokenData);
	if (
		!secretWithVersionAndChecksum ||
		secretWithVersionAndChecksum.length <= 4
	) {
		return undefined;
	}

	// We always assume that the buffer will have 32 bits CRC at the end
	// That way, we can later make the secret part larger or smaller
	const suppliedChecksum = secretWithVersionAndChecksum.slice(
		secretWithVersionAndChecksum.length - 4,
	);

	if (suppliedChecksum.length !== 4) {
		return undefined;
	}

	const secretAndVersionBuffer = secretWithVersionAndChecksum.slice(
		0,
		secretWithVersionAndChecksum.length - 4,
	);
	const actualChecksum = crc32(secretAndVersionBuffer);

	const isSyntacticallyValid =
		secretAndVersionBuffer.length > 0 &&
		buffersEqual(suppliedChecksum, actualChecksum);

	const suppliedVersion =
		secretAndVersionBuffer[secretAndVersionBuffer.length - 1];

	if (suppliedVersion !== version) {
		return undefined; // version doesn't seem supported
	}

	const secretPayload = secretAndVersionBuffer.slice(
		0,
		secretAndVersionBuffer.length - 1,
	);

	return {
		version: suppliedVersion,
		prefixWithoutUnderscore: prefix,
		secret: secretPayload,
		suppliedChecksum,
		actualChecksum,
		isSyntacticallyValid,
	};
}

function buffersEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) {
		return false;
	}

	for (let i = 0; i < a.byteLength; ++i) {
		if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
}
