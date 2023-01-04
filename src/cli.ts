import { createTokenGenerator } from "./index.js";

const prefixWithoutUnderscore = process.argv[2] ?? process.env.CYBERTOKEN_PREFIX;

if(!prefixWithoutUnderscore) {
  console.error("Please specify a prefix for the token.");
  console.error("A prefix must be a non-empty string.");
  console.error();
  console.error("Usage:");
  console.error("  cybertoken <prefix>");
  console.error();
  console.error("You can also provide the prefix via the CYBERTOKEN_PREFIX environment variable.");
  console.error("For example:");
  console.error("  CYBERTOKEN_PREFIX=foo cybertoken");
  process.exit(1);
}

const tokenGenerator = createTokenGenerator({
  prefixWithoutUnderscore,
});

const token = tokenGenerator.generateToken();
console.log(token);

