import fs from 'node:fs/promises';
import path from 'node:path';

const auditDir = path.join(process.cwd(), '.next', 'optimizer-audit');

async function ensureDir() {
    try {
        await fs.mkdir(auditDir, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

export async function writeAuditRecord(record) {
    try {
        await ensureDir();
        const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.json`;
        const filepath = path.join(auditDir, filename);
        await fs.writeFile(filepath, JSON.stringify(record, null, 2), 'utf8');
    } catch (err) {
        console.warn('optimizer audit write failed', err.message);
    }
}

