# Encryption Guide

Fine Dining encrypts sensitive data in transit using TLS. For local MongoDB deployments, start `mongod` with `--enableEncryption` or store data on an encrypted volume. Cloud providers such as Atlas handle encryption at rest automatically.
