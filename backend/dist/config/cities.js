"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCityBySlug = exports.citiesConfig = void 0;
exports.citiesConfig = [
    {
        id: 'delhi',
        name: 'Delhi',
        slug: 'delhi',
        title: 'Flats & Roommates in Delhi | Flatmates.co.in',
        description: 'Find the best flats for rent and roommates in Delhi. Explore popular areas like Hauz Khas, Saket, and Greater Kailash.',
        popularAreas: ['Hauz Khas', 'Saket', 'Greater Kailash', 'Lajpat Nagar', 'Dwarka', 'Karol Bagh'],
        keywords: ['flats in delhi', 'roommates delhi', 'rent in delhi', 'hauz khas flats']
    },
    {
        id: 'mumbai',
        name: 'Mumbai',
        slug: 'mumbai',
        title: 'Flats & Roommates in Mumbai | Flatmates.co.in',
        description: 'Discover flatshares and PG in Mumbai. Browse listings in Andheri, Bandra, Powai, and South Mumbai.',
        popularAreas: ['Andheri West', 'Bandra West', 'Powai', 'Worli', 'Colaba', 'Juhu'],
        keywords: ['mumbai flats', 'roommates mumbai', 'rent in mumbai', 'andheri apartments']
    },
    {
        id: 'bangalore',
        name: 'Bangalore',
        slug: 'bangalore',
        title: 'Flats & Roommates in Bangalore | Flatmates.co.in',
        description: 'Looking for a flat in Bangalore? Search for roommates and apartments in Koramangala, Indiranagar, and Whitefield.',
        popularAreas: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Electronic City', 'JP Nagar'],
        keywords: ['bangalore flats', 'roommates bangalore', 'rent in bangalore', 'koramangala flats']
    },
    {
        id: 'pune',
        name: 'Pune',
        slug: 'pune',
        title: 'Flats & Roommates in Pune | Flatmates.co.in',
        description: 'Find affordable rooms and flats in Pune. Check out Hinjewadi, Viman Nagar, and Baner.',
        popularAreas: ['Hinjewadi', 'Viman Nagar', 'Baner', 'Kothrud', 'Hadapsar', 'Magarpatta'],
        keywords: ['pune flats', 'roommates pune', 'rent in pune', 'hinjewadi rooms']
    },
    {
        id: 'hyderabad',
        name: 'Hyderabad',
        slug: 'hyderabad',
        title: 'Flats & Roommates in Hyderabad | Flatmates.co.in',
        description: 'Search for flats and roommates in Hyderabad. Popular zones: Gachibowli, Madhapur, and Jubilee Hills.',
        popularAreas: ['Gachibowli', 'Madhapur', 'Jubilee Hills', 'Banjara Hills', 'Kondapur', 'Hitech City'],
        keywords: ['hyderabad flats', 'roommates hyderabad', 'rent in hyderabad', 'gachibowli flats']
    }
];
const getCityBySlug = (slug) => exports.citiesConfig.find(city => city.slug === slug);
exports.getCityBySlug = getCityBySlug;
//# sourceMappingURL=cities.js.map