/****************************************************
 * File: components/OverEngineeredCopyright.jsx
 * Description: A highly modular, prop-friendly, and
 *              extravagantly overbuilt Next.js
 *              component to display a copyright notice.
 ****************************************************/

import React, { useEffect, useState } from 'react';



/**
 * Renders an outrageously over-engineered copyright notice,
 * complete with props for brand identity, optional messages,
 * and a dynamic year powered by an unnecessary GraphQL query.
 *
 * @function OverEngineeredCopyright
 * @param {object} props - The properties object.
 * @param {string} props.companyName - Name of the company or entity.
 * @param {number} [props.startYear] - Year the company started (if any).
 * @param {number} [props.overrideYear] - A year to forcibly override the GraphQL result.
 * @param {number} [props.fallbackYear] - A year to fall back on if GraphQL fails.
 * @param {string} [props.message] - Additional text to display after the year range.
 * @returns {JSX.Element} A thoroughly verbose component that makes
 *                        you question every life choice leading up to
 *                        this point in your dev career.
 *
 * @example
 * // Usage in a Next.js page:
 * import React from 'react';
 * import OverEngineeredCopyright from '../components/OverEngineeredCopyright';
 *
 * export default function Home() {
 *   return (
 *     <div>
 *       <h1>Welcome to The Over-Engineered Next.js App</h1>
 *       <OverEngineeredCopyright
 *         companyName="ExampleCorp"
 *         startYear={1995}
 *         overrideYear={2025}
 *         fallbackYear={2023}
 *         message="All rights somewhat reserved."
 *       />
 *     </div>
 *   );
 * }
 */
export default function OverEngineeredCopyright({
                                                    companyName,
                                                    startYear,
                                                    overrideYear,
                                                    fallbackYear,
                                                    message,
                                                }) {
    const currentYear = useYearFetcher({ overrideYear, fallbackYear });

    /**
     * Constructs a string representing either a single year
     * or a range if startYear is provided and differs from currentYear.
     *
     * @function buildYearRange
     * @param {number} start - The year to start from.
     * @param {number} end   - The final year (usually the current year).
     * @returns {string} A string representing either a single year
     *                   or a range (e.g., "2020 - 2025").
     */
    const buildYearRange = (start, end) => {
        if (!start) return `${end}`;
        if (start === end) return `${end}`;
        return `${start} - ${end}`;
    };

    return (
        <footer
            style={{
                textAlign: 'center',
                padding: '1rem',
                border: '2px dashed #ccc',
                backgroundColor: '#f7f7f7',
            }}
        >
            <div style={{ marginBottom: '0.5rem' }}>
                &copy; {buildYearRange(startYear, currentYear)} {companyName || 'YourCompany'}
            </div>
            <div style={{ fontStyle: 'italic', color: '#666' }}>
                {message || 'All rights reserved.'}
            </div>
        </footer>
    );
}
