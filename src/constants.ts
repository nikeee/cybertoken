import baseX from "base-x";

// Alphabet taken from: https://en.wikipedia.org/wiki/Base62
// Important: upper case chars come before the lower case ones
export const alphabet =
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const version = 0;
export const base62 = baseX(alphabet);
