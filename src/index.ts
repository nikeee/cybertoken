import crc32 from "./crc32.js";
import { base62, version } from "./constants.js";
import { getTokenPattern, parseTokenData } from "./parse.js";

// Node.js seems to have problems with a global crypto module (probably it has its own crypto module)
const cryptoServices =
  globalThis.crypto ?? (require("node:crypto").webcrypto as Crypto);

export interface TokenGeneratorOptions {
  /**
   * The prefix of the token without the underscore. Prefer short prefixes.
   * See which prefixes GitHub uses:
   * https://github.blog/2021-04-05-behind-githubs-new-authentication-token-formats/
   */
  prefixWithoutUnderscore: string;

  /**
   * Must at least be `21`.
   * @default 30 bytes
   */
  entropyBytes?: number;
}

export function createTokenGenerator(options: TokenGeneratorOptions) {
  if (!options.prefixWithoutUnderscore) {
    throw new Error(
      "The `prefixWithoutUnderscore` option is required and must not be an empty string."
    );
  }

  const prefixWithUnderscore = options.prefixWithoutUnderscore + "_";
  const tokenPattern = getTokenPattern(prefixWithUnderscore);

  const tokenSecretByteCount = options.entropyBytes ?? 30;
  if (tokenSecretByteCount <= 20) {
    throw new Error(
      "The token secret byte count (`entropyBytes`) must be greater than 20."
    );
  }

  return {
    generateToken,
    isTokenString,
  };

  function generateToken(): string {
    const tokenData = generateTokenData();

    const encodedData = base62.encode(tokenData);
    return prefixWithUnderscore + encodedData;
  }

  /**
   * @remarks As the token generation uses cryptographically secure random numbers, keep in mind that generating a large amount of tokens will block the entire application for a short amount of time (until the entropy pool is filled again).
   * This can lead to a Denial of Service (DoS) attack, so you might want to limit the amount of tokens that can be generated in a short amount of time.
   */
  function generateTokenData(): Uint8Array {
    const entropyWithVersion = cryptoServices.getRandomValues(
      new Uint8Array(tokenSecretByteCount + 1)
    );

    entropyWithVersion[entropyWithVersion.length - 1] = version;

    const checksum = crc32(entropyWithVersion);
    console.assert(checksum.byteLength === 4);

    const payloadWithChecksum = new Uint8Array(
      entropyWithVersion.byteLength + checksum.byteLength
    );
    payloadWithChecksum.set(entropyWithVersion, 0);
    payloadWithChecksum.set(checksum, entropyWithVersion.byteLength);
    console.assert(payloadWithChecksum.length === tokenSecretByteCount + 4 + 1); // + 1 for the version, + 4 for the checksum

    return payloadWithChecksum;
  }

  /**
   * Function to check if a token is syntactically valid. **Not** used for token validation.
   * You can use this for secret scanning or as a heuristic/optimization before asking some backend whether the token is valid.
   *
   * @param value The token candidate to check
   * @returns `true` if the token is syntactically valid, `false` otherwise.
   */
  function isTokenString(value: unknown): boolean {
    // First check if it is syntactically valid
    if (
      !value ||
      typeof value !== "string" ||
      !value.startsWith(prefixWithUnderscore) ||
      !tokenPattern.test(value)
    ) {
      return false;
    }

    // And then, check if it has the correct checksum (can be pretty expensive)
    const tokenData = parseTokenData(value);
    return !!tokenData && tokenData.isSyntacticallyValid;
  }
}
