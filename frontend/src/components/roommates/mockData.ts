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

export const mockRoommates: Roommate[] = [
    {
        id: '1',
        name: 'Aarav',
        age: 24,
        gender: 'Male',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        activeStatus: 'Active 2h ago',
        budget: {
            min: 15000,
            max: 25000
        },
        location: {
            city: 'Bangalore',
            area: 'Koramangala'
        },
        moveInDate: '2023-11-01',
        preferences: {
            food: 'Non-Veg',
            smoking: false,
            drinking: true,
            occupation: 'Professional',
            cleanliness: 'High'
        },
        compatibilityScore: 92,
        verification: {
            phone: true,
            id: true
        }
    },
    {
        id: '2',
        name: 'Priya',
        age: 22,
        gender: 'Female',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        activeStatus: 'Active 10m ago',
        budget: {
            min: 10000,
            max: 18000
        },
        location: {
            city: 'Pune',
            area: 'Viman Nagar'
        },
        moveInDate: '2023-10-25',
        preferences: {
            food: 'Veg',
            smoking: false,
            drinking: false,
            occupation: 'Student',
            cleanliness: 'Medium'
        },
        compatibilityScore: 85,
        verification: {
            phone: true,
            id: false
        }
    },
    {
        id: '3',
        name: 'Rohan',
        age: 27,
        gender: 'Male',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        activeStatus: 'Active 1d ago',
        budget: {
            min: 20000,
            max: 35000
        },
        location: {
            city: 'Delhi',
            area: 'Saket'
        },
        preferences: {
            food: 'Non-Veg',
            smoking: true,
            drinking: true,
            occupation: 'WFH',
            cleanliness: 'Medium'
        },
        compatibilityScore: 78,
        verification: {
            phone: true,
            id: true
        }
    },
    {
        id: '4',
        name: 'Sneha',
        age: 25,
        gender: 'Female',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        activeStatus: 'Active 5h ago',
        budget: {
            min: 12000,
            max: 20000
        },
        location: {
            city: 'Mumbai',
            area: 'Andheri West'
        },
        moveInDate: '2023-11-15',
        preferences: {
            food: 'Veg',
            smoking: false,
            drinking: true,
            occupation: 'Professional',
            cleanliness: 'High'
        },
        compatibilityScore: 88,
        verification: {
            phone: true,
            id: true
        }
    }
];
