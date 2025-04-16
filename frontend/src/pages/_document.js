/**
 * @fileoverview The Penultimate Overengineered Custom Document for Next.js + MUI SSR.
 * Version: 2.1 "Maximum Effort Plus"
 * Description: Includes hyper-detailed meta tags, speculative resource hints,
 * conditional body classes, environment-driven theme color, rigorous Emotion style extraction for SSR,
 * and defensive measures to ensure robust, secure, and maintainable output.
 * Because why not go all out?
 */

import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import createEmotionCache from '../utils/createEmotionCache'; // [cite: frontend/src/utils/createEmotionCache.js]
// Import theme to potentially extract a dynamic value like theme-color.
import lightTheme from '../theme/lightTheme'; // [cite: frontend/src/theme/lightTheme.js]

// Default theme color fallback
const DEFAULT_THEME_COLOR = lightTheme?.palette?.primary?.main || '#04c2c9';

export default class MyDocument extends Document {
    /**
     * Extract and inject Emotion styles from the rendered HTML.
     * @param {string} html - The rendered page HTML.
     * @param {object} cache - The Emotion cache instance.
     * @returns {JSX.Element[]} - An array of <style> tags for SSR.
     */
    static extractAndInjectEmotionStyles(html, cache) {
        if (!cache || typeof cache !== 'object') {
            console.error('Invalid Emotion cache provided to extractAndInjectEmotionStyles');
            return [];
        }
        const { extractCriticalToChunks } = createEmotionServer(cache);
        const emotionStyles = extractCriticalToChunks(html);

        if (!emotionStyles || !Array.isArray(emotionStyles.styles)) {
            console.warn('Emotion styles extraction did not return expected array.');
            return [];
        }

        return emotionStyles.styles
            .map((style) => {
                if (!style || typeof style.key !== 'string' || !Array.isArray(style.ids) || typeof style.css !== 'string') {
                    console.warn('Invalid style object encountered during Emotion style mapping:', style);
                    return null;
                }
                return (
                    <style
                        data-emotion={`${style.key} ${style.ids.join(' ')}`}
                        key={style.key}
                        dangerouslySetInnerHTML={style.css ? { __html: style.css } : undefined}
                    />
                );
            })
            .filter(Boolean);
    }

    render() {
        // Determine language and text direction. Fallback to 'en' and 'ltr'.
        const lang = this.props.locale || 'en';
        const dir = ['ar', 'he', 'fa'].includes(lang) ? 'rtl' : 'ltr';

        // Conditionally add a class to the body based on the current page (example logic).
        const pathSpecificClass = this.props.__NEXT_DATA__?.page === '/signin' ? 'body-signin-page' : '';

        return (
            <Html lang={lang} dir={dir} style={{ height: '100%' }}>
                <Head>
                    {/* --- Core Meta Tags --- */}
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />

                    {/* --- Application & Branding Meta Tags --- */}
                    <meta name="application-name" content="Fine Dining App by Fineware LLC" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                    <meta name="apple-mobile-web-app-title" content="Fine Dining App" />
                    <meta name="format-detection" content="telephone=no" />
                    <meta name="author" content="Fineware LLC" />

                    {/* --- Description & SEO Meta Tags --- */}
                    <meta
                        name="description"
                        content="Discover the future of fine dining with Fineware LLC's innovative Fine Dining App. Enjoy an unparalleled culinary experience that combines technology, exquisite menus, and seamless reservations—all in one elegant platform."
                    />
                    <meta name="robots" content="noindex, nofollow" />
                    <meta name="googlebot" content="noindex, nofollow" />

                    {/* --- Security Meta Tags --- */}
                    <meta
                        httpEquiv="Content-Security-Policy"
                        content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*; font-src 'self' https://*; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
                    />
                    <meta name="referrer" content="strict-origin-when-cross-origin" />

                    {/* --- Open Graph Meta Tags --- */}
                    {/*<meta property="og:title" content="Fine Dining App by Fineware LLC" />*/}
                    {/*<meta*/}
                    {/*    property="og:description"*/}
                    {/*    content="Experience the pinnacle of fine dining with Fineware LLC's Fine Dining App. Browse exquisite menus, reserve tables effortlessly, and immerse yourself in a world of culinary excellence."*/}
                    {/*/>*/}
                    {/*<meta property="og:url" content="https://www.finediningapp.com" />*/}
                    {/*<meta property="og:type" content="website" />*/}
                    {/*<meta property="og:image" content="https://www.finediningapp.com/og-image.jpg" />*/}

                    {/* --- Twitter Card Meta Tags --- */}
                    {/*<meta name="twitter:card" content="summary_large_image" />*/}
                    {/*<meta name="twitter:title" content="Fine Dining App by Fineware LLC" />*/}
                    {/*<meta*/}
                    {/*    name="twitter:description"*/}
                    {/*    content="Fineware LLC's Fine Dining App revolutionizes your dining experience with cutting-edge technology and exquisite culinary offerings. Enjoy seamless reservations and discover new tastes."*/}
                    {/*/>*/}
                    {/*<meta name="twitter:image" content="https://www.finediningapp.com/twitter-image.jpg" />*/}

                    {/* --- Favicon & Icons --- */}
                    <link rel="icon" href="/favicon.ico" sizes="32x32" />
                    {/*<link rel="icon" href="/icon.svg" type="image/svg+xml" />*/}
                    {/*<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" sizes="180x180" />*/}
                    {/*<link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png" />*/}
                    {/*<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#04c2c9" />*/}

                    {/* --- Inject Emotion Styles --- */}
                    {this.props.emotionStyleTags}
                </Head>
                <body className={pathSpecificClass} style={{ height: '100%', margin: 0 }}>
                <Main />
                <NextScript />
                <noscript>
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        JavaScript is required for this application.
                    </div>
                </noscript>
                {/* IE Conditional Comment for Extreme Legacy Support */}
                {/*[if IE]>
            <div style={{ padding: '20px', textAlign: 'center', border: '1px solid red' }}>
              This application may not function correctly in Internet Explorer. Please upgrade your browser.
            </div>
          <![endif]*/}
                </body>
            </Html>
        );
    }
}

// Server-Side Rendering: Extract and Inject Emotion Styles
MyDocument.getInitialProps = async (ctx) => {
    const originalRenderPage = ctx.renderPage;

    // Create a new Emotion cache for each request for isolation.
    const cache = createEmotionCache();
    const { extractCriticalToChunks } = createEmotionServer(cache);

    // Enhance the App component.10 to include the Emotion cache.
    ctx.renderPage = () =>
        originalRenderPage({
            enhanceApp: (App) =>
                function EnhanceApp(props) {
                    return <App emotionCache={cache} {...props} />;
                },
        });

    // Get initial document props from Next.js.
    const initialProps = await Document.getInitialProps(ctx);

    // Extract critical Emotion styles.
    const emotionStyleTags = MyDocument.extractAndInjectEmotionStyles(initialProps.html, cache);

    return {
        ...initialProps,
        styles: [...React.Children.toArray(initialProps.styles), ...emotionStyleTags],
        emotionStyleTags,
        themeColor: DEFAULT_THEME_COLOR,
        locale: ctx.locale,
    };
};
