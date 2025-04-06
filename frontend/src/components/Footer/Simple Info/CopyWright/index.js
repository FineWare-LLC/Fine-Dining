// components/Footer/Simple Info/CopyWright/index.js
import React from 'react';
// Removed unused imports: useEffect, useState, gql, useQuery

/**
 * Renders a simplified copyright notice.
 *
 * @function CopyrightNotice
 * @param {object} props - The properties object.
 * @param {string} [props.companyName='YourCompany'] - Name of the company or entity.
 * @param {number} [props.startYear] - Year the company started (if any).
 * @param {string} [props.message='All rights reserved.'] - Additional text.
 * @returns {JSX.Element} A functional copyright component.
 */
export default function CopyrightNotice({
                                                    companyName = 'YourCompany', // Added default value
                                                    startYear,
                                                    message = 'All rights reserved.', // Added default value
                                                }) {
    // Get the current year directly
    const currentYear = new Date().getFullYear();

    /**
     * Constructs a string representing either a single year or a range.
     */
    const buildYearRange = (start, end) => {
        if (!start || isNaN(start)) return `${end}`; // Handle null/invalid startYear
        const startNum = Number(start);
        if (startNum === end) return `${end}`;
        // Show range only if start is genuinely before end
        if (startNum < end) return `${startNum} - ${end}`;
        // If startYear is in the future or invalid, just show current year
        return `${end}`;
    };

    return (
        <footer
            style={{
                textAlign: 'center',
                padding: '1rem',
                border: '2px dashed #ccc',
                backgroundColor: '#f7f7f7',
                marginTop: '2rem' // Added some margin for spacing
            }}
        >
            <div style={{marginBottom: '0.5rem'}}>
                &copy; {buildYearRange(startYear, currentYear)} {companyName}
            </div>
            <div style={{fontStyle: 'italic', color: '#666'}}>
                {message}
            </div>
        </footer>
    );
}