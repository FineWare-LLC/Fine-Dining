module.exports = {
    async headers() {
        const isDev = process.env.NODE_ENV !== 'production';
        const scriptSrc = isDev ? "'self' 'unsafe-inline'" : "'self'";
        const styleSrc = isDev ? "'self' 'unsafe-inline'" : "'self'";
        const csp = [
            "default-src 'self'",
            `script-src ${scriptSrc}`,
            `style-src ${styleSrc}`,
            "img-src 'self' data: https://*",
            "font-src 'self' https://*",
            "connect-src 'self'",
            "object-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; ') + ';';

        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: csp,
                    },
                ],
            },
        ];
    },
};
