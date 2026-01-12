import { calculateMatchScore } from './matchScore';

describe('calculateMatchScore', () => {
    const defaultUserPrefs: any = {
        budget: { max: 50000 },
        gender: 'Male',
        lifestyle: ['Non-Smoker', 'Veg']
    };

    const defaultListing: any = {
        price: { amount: 40000 },
        preferences: {
            gender: 'Male',
            lifestyle: ['Non-Smoker', 'Veg']
        }
    };

    test('should return 100% for an exact match', () => {
        const score = calculateMatchScore(defaultUserPrefs, defaultListing);
        expect(score).toBe(100);
    });

    test('should handle budget mismatch within margin', () => {
        const listing = { ...defaultListing, price: { amount: 55000 } }; // Within 20% of 50k
        const score = calculateMatchScore(defaultUserPrefs, listing);
        // Budget weight is 25. Exact match gets 25. Within 20% gets 15.
        // Total weight = 25 (budget) + 25 (gender) + 30 (lifestyle) = 80
        // Points = 15 (budget) + 25 (gender) + 30 (lifestyle) = 70
        // (70 / 80) * 100 = 87.5 -> 88
        expect(score).toBe(88);
    });

    test('should handle completely different gender preference', () => {
        const listing = {
            ...defaultListing,
            preferences: { ...defaultListing.preferences, gender: 'Female' }
        };
        const score = calculateMatchScore(defaultUserPrefs, listing);
        // Total weight = 80
        // Points = 25 (budget) + 0 (gender) + 30 (lifestyle) = 55
        // (55 / 80) * 100 = 68.75 -> 69
        expect(score).toBe(69);
    });

    test('should handle shared lifestyle ratio', () => {
        const listing = {
            ...defaultListing,
            preferences: { ...defaultListing.preferences, lifestyle: ['Veg'] }
        };
        const score = calculateMatchScore(defaultUserPrefs, listing);
        // Lifestyle points: 1 shared out of 2 = 0.5 * 30 = 15
        // Total weight = 80
        // Points = 25 (budget) + 25 (gender) + 15 (lifestyle) = 65
        // (65 / 80) * 100 = 81.25 -> 81
        expect(score).toBe(81);
    });

    test('should handle missing data safely', () => {
        const score = calculateMatchScore({}, {});
        expect(score).toBe(100); // Default for no preferences
    });

    test('should handle undefined preferences in listing', () => {
        const score = calculateMatchScore(defaultUserPrefs, { price: { amount: 40000 } });
        // Only budget weight (25) will be added to totalWeight
        // Score = (25 / 25) * 100 = 100
        expect(score).toBe(100);
    });
});
