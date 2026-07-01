import { describe, expect, it } from 'vitest';
import { splitContactDisplayName } from '../src/contact/splitContactDisplayName.js';

describe('splitContactDisplayName', () => {
    it('splits multi-token names', () => {
        expect(splitContactDisplayName('Alice Chen')).toEqual({ firstName: 'Alice', lastName: 'Chen' });
    });

    it('returns empty parts for blank input', () => {
        expect(splitContactDisplayName('   ')).toEqual({ firstName: '', lastName: '' });
    });
});
