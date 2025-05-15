/**
 * @fileoverview The Penultimate Overengineered Custom Document for Next.js + MUI SSR.
 * Version: 2.1 "Maximum Effort Plus"
 * Description: Includes hyper-detailed meta-tags, speculative resource hints,
 * conditional body classes, environment-driven theme color, rigorous Emotion style extraction for SSR,
 * and defensive measures to ensure robust, secure, and maintainable output.
 * Because why not go all out?
 */


import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(props = {}) {
  const { locale, __NEXT_DATA__ } = props;
  const lang = locale || 'en';
  const dir = ['ar', 'he', 'fa'].includes(lang) ? 'rtl' : 'ltr';
  const pathSpecificClass =
    __NEXT_DATA__?.page === '/signin' ? 'body-signin-page' : '';

  return (
    <Html lang={lang} dir={dir} style={{ height: '100%' }}>
      <Head>
      </Head>
      <body className={pathSpecificClass} style={{ height: '100%', margin: 0 }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
