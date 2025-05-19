# Encryption Requirements

Fine Dining requires that all stored data is encrypted at rest. MongoDB Atlas provides encryption at rest by default, including for automated backups. If you deploy your own MongoDB server, enable encryption for the WiredTiger storage engine or use an encrypted filesystem.

## Verifying Encryption in MongoDB Atlas
1. Navigate to **Security > Advanced** in your Atlas project.
2. Confirm that **Encryption at Rest** is enabled for your cluster. Atlas-managed backups inherit this setting and are encrypted automatically.

## Local MongoDB with Encrypted Storage
1. Ensure your MongoDB edition supports the `--enableEncryption` option.
2. Start `mongod` with `--enableEncryption` and specify `--encryptionKeyFile` or use disk-level encryption such as LUKS or BitLocker.
3. Store your encryption keys securely and restrict access to them.

## Encrypted Backups
- Use `mongodump` with the `--ssl` flag and save backup archives to an encrypted volume.
- For filesystem snapshots, ensure the underlying storage or snapshot service uses encryption.
