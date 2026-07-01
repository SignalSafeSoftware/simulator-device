/** Split a display name into first/last tokens for optional host formatting. */
export function splitContactDisplayName(displayName: string): { firstName: string; lastName: string } {
    const trimmed = displayName.trim();
    if (trimmed === '') {
        return { firstName: '', lastName: '' };
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
        return { firstName: parts[0] ?? '', lastName: '' };
    }

    return {
        firstName: parts.slice(0, -1).join(' '),
        lastName: parts[parts.length - 1] ?? '',
    };
}
