// /pages/_document.js
/**
 * @fileoverview Custom Document for Next.js + MUI SSR
 */

import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import createEmotionCache from '../utils/createEmotionCache';

export default class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                </Head>
                <body>
                <Main />
                <NextScript />
                </body>
            </Html>
        );
    }
}

// `getInitialProps` is recommended by MUI to properly SSR styles
MyDocument.getInitialProps = async (ctx) => {
    const originalRenderPage = ctx.renderPage;

    // You can consider sharing the same Emotion cache across all requests,
    // but it is safer to create a new one for each server-side request.
    const cache = createEmotionCache();
    const { extractCriticalToChunks } = createEmotionServer(cache);

    // If you have a custom App, make sure it passes `emotionCache` to your pages.
    ctx.renderPage = () =>
        originalRenderPage({
            // Take React components and wrap them in an Emotion cache provider
            enhanceApp: (App) =>
                function EnhanceApp(props) {
                    return <App emotionCache={cache} {...props} />;
                }
        });

    const initialProps = await Document.getInitialProps(ctx);

    // Extract the styles as <style> tags
    const emotionStyles = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = emotionStyles.styles.map((style) => (
        <style
            data-emotion={`${style.key} ${style.ids.join(' ')}`}
            key={style.key}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: style.css }}
        />
    ));

    return {
        ...initialProps,
        // Combine the MUI styles with Emotion’s
        styles: [
            ...React.Children.toArray(initialProps.styles),
            ...emotionStyleTags
        ]
    };
};
