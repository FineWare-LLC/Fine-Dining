// @ts-nocheck

const SHARED_LABEL = 'Shared';
const PRIVATE_LABEL = 'Private';
const SHARED_ARIA_LABEL = 'Shared cookbook';
const PRIVATE_ARIA_LABEL = 'Private cookbook';

export function buildCookbookSharingDisplayState(cookbook = {}) {
    const isPublic = cookbook?.isPublic === true;

    return {
        isPublic,
        label: isPublic ? SHARED_LABEL : PRIVATE_LABEL,
        ariaLabel: isPublic ? SHARED_ARIA_LABEL : PRIVATE_ARIA_LABEL,
        color: isPublic ? 'success' : 'default',
        variant: isPublic ? 'filled' : 'outlined',
    };
}
