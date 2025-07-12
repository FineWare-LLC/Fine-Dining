import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, '../highs-pipeline/data/processed/restaurant_meals_processed.csv');
const csv = fs.readFileSync(dataFile, 'utf8');
const lines = csv.trim().split(/\r?\n/);
const headers = lines[0].split(',');
const records = lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i]; });
    return obj;
});
const n = records.length;

const calories = Float32Array.from(records.map(r => parseFloat(r.calories)));
const protein = Float32Array.from(records.map(r => parseFloat(r.protein)));
const carbs = Float32Array.from(records.map(r => parseFloat(r.carbohydrates)));
const sodium = Float32Array.from(records.map(r => parseFloat(r.sodium)));

const columnLowerBounds = new Float32Array(n).fill(0);
const columnUpperBounds = new Float32Array(n).fill(6);
const objectiveWeights = new Float32Array(n).fill(0);
const rowLowerBounds = new Float32Array([2200,100,250,1500]);
const rowUpperBounds = new Float32Array([2600,160,350,2300]);
const offsets = new Int32Array([0,n,2*n,3*n,4*n]);
const indices = n < 65536 ? new Int16Array(4*n) : new Int32Array(4*n);
const values = new Float32Array(4*n);
for(let r=0;r<4;r++) for(let c=0;c<n;c++) indices[r*n+c]=c;
for(let i=0;i<n;i++){ values[0*n+i]=calories[i]*0.5; values[1*n+i]=protein[i]*0.5; values[2*n+i]=carbs[i]*0.5; values[3*n+i]=sodium[i]*0.5; }

console.log('Heap Used MB:', (process.memoryUsage().heapUsed/1024/1024).toFixed(2));
