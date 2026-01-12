export interface Roommate {
    id: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    image: string;
    activeStatus: string;
    budget: {
        min: number;
        max: number;
    };
    location: {
        city: string;
        area: string;
    };
    moveInDate?: string;
    preferences: {
        food: 'Veg' | 'Non-Veg' | 'Eggetarian' | 'Vegan';
        smoking: boolean;
        drinking: boolean;
        occupation: 'Student' | 'Professional' | 'WFH';
        cleanliness: 'Low' | 'Medium' | 'High';
    };
    compatibilityScore: number;
    verification: {
        phone: boolean;
        id: boolean;
    };
}
