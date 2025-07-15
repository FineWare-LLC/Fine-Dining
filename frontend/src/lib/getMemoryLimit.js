export default function getMemoryLimit() {
    const arg = process.execArgv.find(a => a.startsWith('--max-old-space-size='));
    if (arg) return Number(arg.split('=')[1]);

    const env = process.env.NODE_OPTIONS || '';
    const match = env.match(/--max-old-space-size=(\d+)/);
    return match ? Number(match[1]) : null;
}
