# Sensitive Request Adapters

`datasource.js` and `sshConfig.js` wrap the existing API modules. Queries are
delegated unchanged; sensitive writes use `sensitiveRequest.js` to read the full
response envelope, encrypt credentials and retry key errors at most once.

Only an explicit `enabled: false` permits plaintext. Missing keys, HTTP failures,
unsupported protocols and encryption failures stop the write. Kafka SSL fields
are encrypted only when present; these adapters do not restore SSL form mapping.

JSEncrypt 3.2.1 supports BMP text but incorrectly encodes UTF-16 surrogates.
Surrogates (including emoji) and values over 245 UTF-8 bytes are rejected before
submission. Supporting supplementary characters requires a compatible encoder.

Run the behavioral regression suite from the repository root:

```sh
node --test src/pages/integration/dataIntegration/services/sensitiveRequest.test.js
```

The suite exercises the real adapters with mocked transport and generated RSA
keys, checking encryption interoperability, all six endpoints, return contracts,
field preservation, cache expiry/concurrency, bounded retries and cancellation.
It runs manually and is not currently connected to CI. Backend and browser
integration testing are still required before rollout.
