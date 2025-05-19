import { NextResponse } from 'next/server';
import { setSecurityHeaders, setCORSHeaders, assignRequestId } from '../utils/headers.js';

export function middleware(req) {
    const res = NextResponse.next();
    assignRequestId(res);
    setSecurityHeaders(res);
    setCORSHeaders(res, req.headers.get('origin') || '');
    return res;
}
