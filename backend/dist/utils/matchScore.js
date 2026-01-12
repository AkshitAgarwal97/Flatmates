"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMatchScore = void 0;
const calculateMatchScore = (userPrefs, listingPrefs) => {
    let totalWeight = 0;
    let matchPoints = 0;
    // 1. Budget (Weight: 25)
    if (userPrefs.budget && listingPrefs.price) {
        totalWeight += 25;
        const userMax = userPrefs.budget.max || 100000;
        const listingPrice = listingPrefs.price.amount || 0;
        if (listingPrice <= userMax) {
            matchPoints += 25;
        }
        else if (listingPrice <= userMax * 1.2) {
            matchPoints += 15; // Within 20% margin
        }
    }
    // 2. Gender (Weight: 25) - Critical for roommate matching
    if (userPrefs.gender && listingPrefs.preferences?.gender) {
        totalWeight += 25;
        if (listingPrefs.preferences.gender === 'Any' || userPrefs.gender === listingPrefs.preferences.gender) {
            matchPoints += 25;
        }
    }
    // 3. Lifestyle (Weight: 30) - Multi-select comparison
    if (userPrefs.lifestyle && listingPrefs.preferences?.lifestyle) {
        totalWeight += 30;
        const userLifestyle = userPrefs.lifestyle;
        const listingLifestyle = listingPrefs.preferences.lifestyle;
        const intersection = userLifestyle.filter(x => listingLifestyle.includes(x));
        if (userLifestyle.length > 0) {
            const ratio = intersection.length / userLifestyle.length;
            matchPoints += ratio * 30;
        }
        else {
            matchPoints += 30; // No strict preferences
        }
    }
    // 4. Occupation (Weight: 20)
    if (userPrefs.roomType && listingPrefs.propertyType) {
        // Just as an example comparison
        totalWeight += 20;
        if (userPrefs.roomType === listingPrefs.propertyType) {
            matchPoints += 20;
        }
        else {
            matchPoints += 5;
        }
    }
    if (totalWeight === 0)
        return 100; // Default if no prefs set
    return Math.round((matchPoints / totalWeight) * 100);
};
exports.calculateMatchScore = calculateMatchScore;
//# sourceMappingURL=matchScore.js.map