export interface CityMetadata {
    id: string;
    name: string;
    slug: string;
    title: string;
    description: string;
    popularAreas: string[];
    keywords: string[];
}
export declare const citiesConfig: CityMetadata[];
export declare const getCityBySlug: (slug: string) => CityMetadata | undefined;
//# sourceMappingURL=cities.d.ts.map