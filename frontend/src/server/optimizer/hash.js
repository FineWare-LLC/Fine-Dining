import crypto from 'node:crypto';
import { HASH_NAMESPACE } from './constants.js';

export function hashModelInput(parts) {
    const hash = crypto.createHash('sha256');
    hash.update(HASH_NAMESPACE);
    for (const part of parts) {
        hash.update('\u0000');
        if (typeof part === 'string') {
            hash.update(part);
        } else {
            hash.update(JSON.stringify(part));
        }
    }
    return hash.digest('hex');
}

