export type Hub = {
  city: string;
  locality: string;
  lat: number;
  lng: number;
  blurb: string;
};

export type CitySeo = {
  city: string;
  aliases: string[];
  tagline: string;
  intro: string;
  rents: string;
  commute: string;
  who: string;
};

/** All Indian metro / million-plus cities we target for flatmate & flat search. */
export const HUBS: Hub[] = [
  { city: "Bengaluru", locality: "Koramangala", lat: 12.9352, lng: 77.6245, blurb: "Startup-dense blocks, cafes, and high demand for room shares among product and ops teams." },
  { city: "Bengaluru", locality: "HSR Layout", lat: 12.9121, lng: 77.6446, blurb: "Planned sectors, weekend markets, and a classic first stop for Bengaluru flatmates." },
  { city: "Bengaluru", locality: "Indiranagar", lat: 12.9784, lng: 77.6408, blurb: "Walkable, social, and pricier — confirm noise and parking if you WFH." },
  { city: "Bengaluru", locality: "Whitefield", lat: 12.9698, lng: 77.75, blurb: "IT-corridor living; pin your campus — Whitefield is large and commute times vary block to block." },
  { city: "Bengaluru", locality: "Electronic City", lat: 12.8452, lng: 77.6602, blurb: "South-side tech parks; many 2/3 BHK shares for weekday office goers." },
  { city: "Mumbai", locality: "Bandra", lat: 19.0596, lng: 72.8295, blurb: "Western-line premium; deposits run high — get terms in chat before visiting." },
  { city: "Mumbai", locality: "Powai", lat: 19.1197, lng: 72.905, blurb: "Lakeside tech/education cluster; popular with engineers who want a quieter west-suburb base." },
  { city: "Mumbai", locality: "Andheri", lat: 19.1136, lng: 72.8697, blurb: "Metro + local connectivity; a practical mid-budget Mumbai flatmate hub." },
  { city: "Mumbai", locality: "Worli", lat: 19.0176, lng: 72.8193, blurb: "Sea-link access and corporate offices; confirm society guest rules." },
  { city: "Navi Mumbai", locality: "Vashi", lat: 19.0771, lng: 72.9986, blurb: "Planned node with malls and harbour-line access for people who work in Navi Mumbai." },
  { city: "Navi Mumbai", locality: "Kharghar", lat: 19.0473, lng: 73.0699, blurb: "Newer towers and slightly lower rents than island Mumbai; check last-mile to your office." },
  { city: "Navi Mumbai", locality: "Belapur", lat: 19.0189, lng: 73.039, blurb: "CBD-side Navi Mumbai; useful if you want metro/harbour options without island rents." },
  { city: "Delhi", locality: "Saket", lat: 28.5244, lng: 77.2066, blurb: "South Delhi malls and metro; room shares fill around Select Citywalk and nearby colonies." },
  { city: "Delhi", locality: "Dwarka", lat: 28.5921, lng: 77.046, blurb: "Planned sub-city with Airport Express access; popular with first-job movers to Delhi." },
  { city: "Delhi", locality: "Rohini", lat: 28.7499, lng: 77.0565, blurb: "North-west Delhi sectors; compare water, parking, and metro last-mile." },
  { city: "Delhi", locality: "Hauz Khas", lat: 28.5494, lng: 77.2001, blurb: "Student and creative mix; confirm landlord rules on guests and cooking." },
  { city: "Gurugram", locality: "Cyber City", lat: 28.4949, lng: 77.0869, blurb: "Walk-to-office demand for MNCs; night cabs and society security matter." },
  { city: "Gurugram", locality: "Golf Course Road", lat: 28.4595, lng: 77.1025, blurb: "High-rise corridor; match budget honestly — many listings are 2/3 BHK shares." },
  { city: "Gurugram", locality: "Sohna Road", lat: 28.4089, lng: 77.0478, blurb: "Newer societies south of the old city; pin office because last-mile can be long." },
  { city: "Noida", locality: "Sector 62", lat: 28.627, lng: 77.3649, blurb: "IT/ITES cluster; many professionals split 2/3 BHKs near offices." },
  { city: "Noida", locality: "Sector 18", lat: 28.5708, lng: 77.326, blurb: "Mall and metro node; good if you want weekend access plus a Noida base." },
  { city: "Noida", locality: "Greater Noida", lat: 28.4744, lng: 77.504, blurb: "Knowledge Park / film-city commutes; confirm cab pools and night-shift comfort." },
  { city: "Ghaziabad", locality: "Indirapuram", lat: 28.6411, lng: 77.369, blurb: "NCR overflow from Noida; slightly easier rents for Delhi-NCR office goers." },
  { city: "Ghaziabad", locality: "Vaishali", lat: 28.6501, lng: 77.3399, blurb: "Blue-line metro access into Delhi; popular with people who work in central NCR." },
  { city: "Faridabad", locality: "Sector 15", lat: 28.394, lng: 77.312, blurb: "Older Faridabad core; check water and society rules before depositing." },
  { city: "Faridabad", locality: "Greater Faridabad", lat: 28.4089, lng: 77.3623, blurb: "Newer townships; useful if your job is on the Faridabad–Delhi industrial belt." },
  { city: "Pune", locality: "Hinjawadi", lat: 18.5913, lng: 73.738, blurb: "IT park corridor; ask about cab timings, night shifts, and generator backup." },
  { city: "Pune", locality: "Baner", lat: 18.559, lng: 73.7868, blurb: "West Pune mix of offices and housing; a frequent flatmate search after Hinjawadi." },
  { city: "Pune", locality: "Kharadi", lat: 18.5516, lng: 73.947, blurb: "East Pune IT; compare Magarpatta/Kharadi commute vs west-side parks." },
  { city: "Pune", locality: "Viman Nagar", lat: 18.5679, lng: 73.9143, blurb: "Airport-side; convenient for frequent travellers and north-east office clusters." },
  { city: "Hyderabad", locality: "Gachibowli", lat: 17.4401, lng: 78.3489, blurb: "Financial district / campus corridor; room shares track IT joining cycles." },
  { city: "Hyderabad", locality: "Madhapur", lat: 17.4483, lng: 78.3915, blurb: "Hitech adjacent; cafes and co-working plus dense 2/3 BHK inventory." },
  { city: "Hyderabad", locality: "Kondapur", lat: 17.4647, lng: 78.3588, blurb: "Slightly residential vs Madhapur; still an IT-corridor flatmate favourite." },
  { city: "Hyderabad", locality: "Hitech City", lat: 17.4435, lng: 78.3772, blurb: "Metro + campus walking distance for many roles; confirm visitor parking." },
  { city: "Chennai", locality: "OMR", lat: 12.901, lng: 80.2279, blurb: "Long IT corridor — filter by pin, not just “OMR”, or you will overestimate commute." },
  { city: "Chennai", locality: "Velachery", lat: 12.9815, lng: 80.218, blurb: "South Chennai with MRTS/metro options; mixed student and professional shares." },
  { city: "Chennai", locality: "Anna Nagar", lat: 13.0878, lng: 80.2102, blurb: "Planned west-north neighbourhoods; family-heavy societies, check guest policy." },
  { city: "Chennai", locality: "Porur", lat: 13.0382, lng: 80.1565, blurb: "West Chennai hospitals and offices; practical if you want to avoid full OMR distances." },
  { city: "Kolkata", locality: "Salt Lake", lat: 22.5804, lng: 88.4148, blurb: "Sector-wise planned city; a default Kolkata professional flatmate search." },
  { city: "Kolkata", locality: "New Town", lat: 22.5958, lng: 88.4796, blurb: "Newer towers and IT; compare last-mile vs Salt Lake for your campus." },
  { city: "Kolkata", locality: "Park Street", lat: 22.5548, lng: 88.3516, blurb: "Central social belt; expect older buildings and stricter society rules." },
  { city: "Kolkata", locality: "Howrah", lat: 22.5958, lng: 88.2636, blurb: "Across the Hooghly; cheaper than core Kolkata if your commute uses Howrah station." },
  { city: "Ahmedabad", locality: "SG Highway", lat: 23.0401, lng: 72.5313, blurb: "Corporate highway belt; many 2 BHK shares for first jobs in Ahmedabad." },
  { city: "Ahmedabad", locality: "Prahlad Nagar", lat: 23.012, lng: 72.5113, blurb: "West-side residential high-rises; popular with young professionals." },
  { city: "Ahmedabad", locality: "Satellite", lat: 23.0258, lng: 72.526, blurb: "Established west Ahmedabad; walkable markets plus metro-adjacent pockets." },
  { city: "Surat", locality: "Vesu", lat: 21.1416, lng: 72.7709, blurb: "South Surat growth corridor; diamond/textile professionals often start here." },
  { city: "Surat", locality: "Adajan", lat: 21.186, lng: 72.7933, blurb: "West bank of Tapi; family societies — confirm cooking and guest rules." },
  { city: "Surat", locality: "Vesu Pal", lat: 21.152, lng: 72.783, blurb: "Pal–Vesu overlap; useful if you work on the south-west Surat belt." },
  { city: "Jaipur", locality: "Malviya Nagar", lat: 26.854, lng: 75.805, blurb: "South Jaipur with metro access; a frequent student/professional mix." },
  { city: "Jaipur", locality: "Vaishali Nagar", lat: 26.9118, lng: 75.7455, blurb: "West Jaipur residential; compare commute to Sitapura or city-centre jobs." },
  { city: "Jaipur", locality: "Jagatpura", lat: 26.799, lng: 75.851, blurb: "South-east growth; closer to some colleges and newer apartments." },
  { city: "Lucknow", locality: "Gomti Nagar", lat: 26.8506, lng: 80.9966, blurb: "Planned east Lucknow; default for IT, consulting, and government-adjacent jobs." },
  { city: "Lucknow", locality: "Hazratganj", lat: 26.855, lng: 80.9432, blurb: "Central Lucknow; older flats, walkable markets, tighter parking." },
  { city: "Lucknow", locality: "Aliganj", lat: 26.882, lng: 80.944, blurb: "North-central residential; practical rents vs Gomti Nagar premium pockets." },
  { city: "Kanpur", locality: "Civil Lines", lat: 26.474, lng: 80.317, blurb: "Established Kanpur core; students and professionals share older apartments." },
  { city: "Kanpur", locality: "Swaroop Nagar", lat: 26.482, lng: 80.321, blurb: "Near Civil Lines; confirm water and lift reliability in older buildings." },
  { city: "Kanpur", locality: "Kidwai Nagar", lat: 26.428, lng: 80.322, blurb: "South Kanpur; useful if you commute toward the newer commercial belt." },
  { city: "Nagpur", locality: "MIHAN", lat: 21.069, lng: 79.047, blurb: "Airport/SEZ side; many listings target people joining MIHAN offices." },
  { city: "Nagpur", locality: "Dharampeth", lat: 21.143, lng: 79.062, blurb: "Central Nagpur; walkable markets and mixed 2 BHK shares." },
  { city: "Nagpur", locality: "Wardha Road", lat: 21.113, lng: 79.049, blurb: "South-west arterial; practical if your office sits along the Wardha Road corridor." },
  { city: "Indore", locality: "Vijay Nagar", lat: 22.7533, lng: 75.8937, blurb: "Indore’s commercial growth node; default for new joiners seeking flatmates." },
  { city: "Indore", locality: "Palasia", lat: 22.7244, lng: 75.8839, blurb: "Older central-south; students and working professionals mix here." },
  { city: "Indore", locality: "Scheme 54", lat: 22.7539, lng: 75.8882, blurb: "Planned scheme next to Vijay Nagar; high-rise shares are common." },
  { city: "Bhopal", locality: "MP Nagar", lat: 23.233, lng: 77.434, blurb: "Commercial Bhopal; convenient if you work in offices around New Market / MP Nagar." },
  { city: "Bhopal", locality: "Arera Colony", lat: 23.215, lng: 77.43, blurb: "Established south Bhopal; family societies — check guest and cooking rules." },
  { city: "Bhopal", locality: "Kolar", lat: 23.174, lng: 77.418, blurb: "South-west expansion; newer apartments for people joining Bhopal IT/govt roles." },
  { city: "Kochi", locality: "Kakkanad", lat: 10.0159, lng: 76.3419, blurb: "InfoPark side; the main Kochi flatmate search for IT professionals." },
  { city: "Kochi", locality: "Edappally", lat: 10.0246, lng: 76.3086, blurb: "Metro + mall node; useful if you split time between city and Infopark." },
  { city: "Kochi", locality: "Infopark", lat: 10.011, lng: 76.363, blurb: "Campus-adjacent housing; ask about last-mile autos after late shifts." },
  { city: "Coimbatore", locality: "Peelamedu", lat: 11.026, lng: 77.023, blurb: "College + IT mix; a frequent Coimbatore room-share pocket." },
  { city: "Coimbatore", locality: "Saravanampatti", lat: 11.079, lng: 76.997, blurb: "North Coimbatore IT; many 2 BHK shares near Tidel / IT parks." },
  { city: "Coimbatore", locality: "RS Puram", lat: 11.008, lng: 76.951, blurb: "Older west-central; walkable but tighter parking and older buildings." },
  { city: "Chandigarh", locality: "Sector 17", lat: 30.7398, lng: 76.7827, blurb: "City centre; listings are scarce — expect to look at nearby sectors too." },
  { city: "Chandigarh", locality: "Sector 35", lat: 30.724, lng: 76.765, blurb: "South-west sectors with markets; popular with young professionals." },
  { city: "Chandigarh", locality: "Mohali", lat: 30.7046, lng: 76.7179, blurb: "IT City / Phase pockets; many “Chandigarh” searches actually land in Mohali." },
  { city: "Visakhapatnam", locality: "Madhurawada", lat: 17.821, lng: 83.357, blurb: "IT SEZ north Vizag; default for software joiners." },
  { city: "Visakhapatnam", locality: "Rushikonda", lat: 17.782, lng: 83.385, blurb: "Beach + IT; confirm hill-road commute in monsoon." },
  { city: "Visakhapatnam", locality: "Gajuwaka", lat: 17.68, lng: 83.203, blurb: "Industrial south Vizag; practical if your plant/office is not on the IT hill." },
  { city: "Patna", locality: "Boring Road", lat: 25.6093, lng: 85.123, blurb: "Central Patna commercial spine; many first-job room shares." },
  { city: "Patna", locality: "Kankarbagh", lat: 25.599, lng: 85.154, blurb: "Dense residential; confirm water and parking before you pay deposit." },
  { city: "Patna", locality: "Bailey Road", lat: 25.621, lng: 85.106, blurb: "West-central arterial; mixed flats for students and professionals." },
  { city: "Bhubaneswar", locality: "Patia", lat: 20.353, lng: 85.823, blurb: "Infocity-adjacent; the main Bhubaneswar IT flatmate pocket." },
  { city: "Bhubaneswar", locality: "Chandrasekharpur", lat: 20.33, lng: 85.818, blurb: "North Bhubaneswar residential; quieter than Patia nightlife." },
  { city: "Bhubaneswar", locality: "Infocity", lat: 20.3537, lng: 85.814, blurb: "Campus-side; pin your building — Infocity sprawl is real." },
  { city: "Thiruvananthapuram", locality: "Technopark", lat: 8.551, lng: 76.881, blurb: "Kerala’s large IT campus; most TVM flatmate searches start here." },
  { city: "Thiruvananthapuram", locality: "Kazhakkoottam", lat: 8.556, lng: 76.875, blurb: "Technopark last-mile; confirm bus/auto after late shifts." },
  { city: "Thiruvananthapuram", locality: "Pattom", lat: 8.521, lng: 76.936, blurb: "Closer to city amenities if you do not want to live only on the Technopark belt." },
  { city: "Guwahati", locality: "Zoo Road", lat: 26.166, lng: 91.78, blurb: "Central-east Guwahati; a common first search for Northeast joiners." },
  { city: "Guwahati", locality: "Dispur", lat: 26.1433, lng: 91.7898, blurb: "Capital-side; government and private-job mix." },
  { city: "Guwahati", locality: "Six Mile", lat: 26.134, lng: 91.801, blurb: "GS Road growth; newer apartments for young professionals." },
  { city: "Vadodara", locality: "Alkapuri", lat: 22.313, lng: 73.173, blurb: "Established west Vadodara; walkable and popular with working professionals." },
  { city: "Vadodara", locality: "Gotri", lat: 22.322, lng: 73.148, blurb: "West expansion; many 2 BHK shares near newer societies." },
  { city: "Vadodara", locality: "Akota", lat: 22.295, lng: 73.165, blurb: "South-west residential; practical rents vs Alkapuri premium pockets." },
  { city: "Mysuru", locality: "Vijayanagar", lat: 12.323, lng: 76.614, blurb: "West Mysuru; students and Infosys-adjacent commuters overlap here." },
  { city: "Mysuru", locality: "Gokulam", lat: 12.3235, lng: 76.626, blurb: "North-west residential; quieter than city-centre lodges." },
  { city: "Mysuru", locality: "Hebbal", lat: 12.36, lng: 76.61, blurb: "North Mysuru toward industrial/IT; pin your campus." },
  { city: "Nashik", locality: "College Road", lat: 19.997, lng: 73.789, blurb: "Central Nashik; students and first-job shares mix." },
  { city: "Nashik", locality: "Gangapur Road", lat: 20.006, lng: 73.76, blurb: "West Nashik growth; newer apartments along the Gangapur belt." },
  { city: "Nashik", locality: "Satpur", lat: 19.999, lng: 73.744, blurb: "MIDC side; useful if your plant or office is in Satpur." },
  { city: "Ranchi", locality: "Harmu", lat: 23.37, lng: 85.309, blurb: "Central-west Ranchi; a frequent starting locality for flatmates." },
  { city: "Ranchi", locality: "Doranda", lat: 23.333, lng: 85.31, blurb: "South Ranchi; mixed government and private-job housing." },
  { city: "Ranchi", locality: "Kanke", lat: 23.434, lng: 85.315, blurb: "North toward the lake/institutes; quieter, longer last-mile." },
  { city: "Raipur", locality: "Telibandha", lat: 21.241, lng: 81.661, blurb: "Lake-side commercial; popular with young professionals in Raipur." },
  { city: "Raipur", locality: "Shankar Nagar", lat: 21.251, lng: 81.641, blurb: "Established residential; family societies with room-share demand." },
  { city: "Raipur", locality: "Amapara", lat: 21.238, lng: 81.633, blurb: "Central pockets; confirm parking and water before depositing." },
  { city: "Dehradun", locality: "Rajpur Road", lat: 30.358, lng: 78.068, blurb: "North Dehradun spine; students and working professionals share older houses." },
  { city: "Dehradun", locality: "IT Park", lat: 30.334, lng: 78.042, blurb: "Sahastradhara / IT Park side; pin office — hills change commute times." },
  { city: "Dehradun", locality: "Prem Nagar", lat: 30.344, lng: 77.96, blurb: "West Dehradun; practical if you work toward the Clement Town / Prem Nagar belt." },
  { city: "Mangaluru", locality: "Kadri", lat: 12.889, lng: 74.856, blurb: "Central Mangaluru; a default search for hospital and IT joiners." },
  { city: "Mangaluru", locality: "Bejai", lat: 12.887, lng: 74.842, blurb: "Near Kadri; mixed PG-to-flatmate conversions — verify house rules." },
  { city: "Mangaluru", locality: "Pumpwell", lat: 12.87, lng: 74.855, blurb: "Junction-side; useful if you commute across south Mangaluru." },
  { city: "Ludhiana", locality: "Sarabha Nagar", lat: 30.895, lng: 75.822, blurb: "South-west Ludhiana; established colonies with 2 BHK shares." },
  { city: "Ludhiana", locality: "BRS Nagar", lat: 30.888, lng: 75.807, blurb: "West Ludhiana; popular with working professionals." },
  { city: "Ludhiana", locality: "Ferozepur Road", lat: 30.88, lng: 75.84, blurb: "Arterial commercial; confirm traffic if you WFH and need quiet." },
  { city: "Amritsar", locality: "Ranjit Avenue", lat: 31.635, lng: 74.86, blurb: "Planned Amritsar pocket; a frequent professional room-share search." },
  { city: "Amritsar", locality: "Lawrence Road", lat: 31.634, lng: 74.872, blurb: "Central commercial; older buildings, walkable markets." },
  { city: "Amritsar", locality: "Mall Road", lat: 31.64, lng: 74.879, blurb: "City-centre; expect noise — better for people who want walkable Amritsar." },
  { city: "Vijayawada", locality: "Benz Circle", lat: 16.506, lng: 80.648, blurb: "Central Vijayawada junction; high demand from students and office goers." },
  { city: "Vijayawada", locality: "Gurunanak Colony", lat: 16.518, lng: 80.63, blurb: "West-central residential; practical 2 BHK shares." },
  { city: "Vijayawada", locality: "Auto Nagar", lat: 16.49, lng: 80.7, blurb: "East industrial/commercial; useful if your workplace is not Benz Circle." },
  { city: "Madurai", locality: "Anna Nagar", lat: 9.939, lng: 78.139, blurb: "North Madurai planned area; a common first flatmate search." },
  { city: "Madurai", locality: "KK Nagar", lat: 9.9398, lng: 78.101, blurb: "West Madurai; mixed families and working professionals." },
  { city: "Madurai", locality: "Goripalayam", lat: 9.93, lng: 78.12, blurb: "Closer to old city; confirm parking and noise." },
  { city: "Rajkot", locality: "Kalawad Road", lat: 22.273, lng: 70.747, blurb: "West Rajkot growth; newer apartments for professionals." },
  { city: "Rajkot", locality: "University Road", lat: 22.293, lng: 70.774, blurb: "Student-heavy; diet and guest rules matter in shared kitchens." },
  { city: "Rajkot", locality: "150 Feet Ring Road", lat: 22.303, lng: 70.802, blurb: "Ring-road commercial; pin your office along the belt." },
];

export const CITIES = Array.from(new Set(HUBS.map((h) => h.city)));

export const TIER1_CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Gurugram",
  "Noida",
];

export const HOME_HUBS = HUBS.filter((h) => TIER1_CITIES.includes(h.city));

export const CITY_SEO: CitySeo[] = [
  {
    city: "Bengaluru",
    aliases: ["bangalore", "bengalooru"],
    tagline: "India’s busiest flatmate market",
    intro:
      "Bengaluru (Bangalore) is where most Indian “flatmates” searches begin: Koramangala, HSR Layout, Indiranagar, Whitefield, and Electronic City fill with room shares every joining season. Flatmates.co.in is built for that market — diet, WFH, washroom, and gender preference up front, chat in-app, brokerage ₹0.",
    rents:
      "Room shares in HSR/Koramangala often sit in a mid-to-high band versus Electronic City or outer Whitefield. Always compare rent + deposit + maintenance, not rent alone.",
    commute:
      "Traffic, not kilometres, decides Bengaluru. Pin your office on Browse and ignore listings that look “close” on a city-wide map.",
    who: "Product, support, consulting, and student movers who are done with Facebook Flat and Flatmates spam.",
  },
  {
    city: "Mumbai",
    aliases: ["bombay"],
    tagline: "Western line, harbour line, honest deposits",
    intro:
      "Mumbai flats and flatmates are a deposit-and-commute problem first. Bandra, Andheri, Powai, and Worli behave like different cities. We list peer-to-peer room shares and entire flats with lifestyle tags so you do not discover kitchen or guest conflicts after paying two months’ deposit.",
    rents: "Expect higher deposits than most metros. Get the split, lock-in, and notice period in chat before you visit.",
    commute: "Locals and metro beats road time. Pin workplace; Andheri vs Powai is not interchangeable.",
    who: "Finance, media, tech, and healthcare workers who need a western or harbour-line base.",
  },
  {
    city: "Navi Mumbai",
    aliases: ["new mumbai"],
    tagline: "Planned nodes, harbour-line living",
    intro:
      "Navi Mumbai (Vashi, Kharghar, Belapur) is how many people afford a Mumbai-region flat without island rents. Listings here are still Mumbai-metro intent: rooms, 1/2 BHK shares, and seekers moving to Navi Mumbai offices.",
    rents: "Usually below Bandra/Andheri for similar BHK size — still confirm society deposits.",
    commute: "Harbour line + Navi Mumbai metro pockets. Island jobs need a realistic train budget.",
    who: "People joining Navi Mumbai offices or escaping island rents.",
  },
  {
    city: "Delhi",
    aliases: ["new delhi", "ncr", "delhi ncr"],
    tagline: "South, west, and north Delhi room shares",
    intro:
      "Delhi flatmates searches span Saket, Dwarka, Rohini, and Hauz Khas — plus overflow into Gurugram and Noida. Flatmates.co.in treats Delhi as its own city (not only Gurgaon groups) with ₹0 brokerage and hidden phones.",
    rents: "South Delhi premiums vs Dwarka/Rohini planned sectors. Deposit norms vary by landlord vs current tenant.",
    commute: "Metro lines beat Ring Road peak hours. Pin office; “Delhi” is too big to browse unfiltered.",
    who: "Consulting, media, government, startup, and student movers into the capital.",
  },
  {
    city: "Gurugram",
    aliases: ["gurgaon"],
    tagline: "Cyber City and Golf Course Road shares",
    intro:
      "Gurugram (Gurgaon) flatmates cluster around Cyber City, Golf Course Road, and Sohna Road. Night cabs, society security, and WFH noise matter as much as rent. We match those lifestyle fields before you chat.",
    rents: "High-rise shares can look cheap per person until you add maintenance and parking.",
    commute: "Rapid Metro / cab last-mile. Cyber City walkability is the exception, not the rule.",
    who: "MNC and startup employees who searched “Gurgaon flatmates” and hit broker spam.",
  },
  {
    city: "Noida",
    aliases: ["noida city"],
    tagline: "Sector 62 and Noida–Greater Noida corridor",
    intro:
      "Noida Sector 62, Sector 18, and Greater Noida are classic IT/ITES flatmate markets. Use city + locality pages instead of a generic NCR Facebook group.",
    rents: "Often more 2/3 BHK inventory than central Delhi at the same budget.",
    commute: "Office clusters are sector-specific. Greater Noida is not a Sector 62 substitute.",
    who: "Engineers and BPO/ITES staff joining Noida campuses.",
  },
  {
    city: "Ghaziabad",
    aliases: [],
    tagline: "Indirapuram and Vaishali for NCR overflow",
    intro:
      "Ghaziabad (Indirapuram, Vaishali) is how many people live in NCR while working in Noida or Delhi. Room shares here are a first-class metro target on Flatmates.co.in.",
    rents: "Typically below Noida Sector 18 premiums for similar BHK size.",
    commute: "Blue line from Vaishali; road to Noida sectors. Time the trip at office hours.",
    who: "NCR workers who want slightly easier rents than core Noida.",
  },
  {
    city: "Faridabad",
    aliases: [],
    tagline: "Delhi–Faridabad belt flats",
    intro:
      "Faridabad is an NCR metro city with its own room-share demand along Sector 15 and Greater Faridabad townships — not only a Delhi suburb afterthought.",
    rents: "Township deposits can be high; older sectors vary widely.",
    commute: "Mathura Road / metro extensions. Pin the actual plant or office.",
    who: "Industrial, healthcare, and Delhi-south overflow commuters.",
  },
  {
    city: "Pune",
    aliases: ["poona"],
    tagline: "Hinjawadi, Baner, Kharadi IT living",
    intro:
      "Pune flatmates searches concentrate on Hinjawadi, Baner, Kharadi, and Viman Nagar. Night-shift parks, cab pools, and veg kitchens are the usual deal-breakers — we capture them on every listing.",
    rents: "Hinjawadi Phase variance is huge; compare society, not just “Hinjawadi”.",
    commute: "IT park last-mile eats evenings. Pin campus, not Pune city centre.",
    who: "Engineers and students moving for Pune IT and manufacturing.",
  },
  {
    city: "Hyderabad",
    aliases: [],
    tagline: "Gachibowli, Madhapur, Hitech City",
    intro:
      "Hyderabad’s flat and flatmate demand sits on the west IT corridor: Gachibowli, Madhapur, Kondapur, Hitech City. Direct listings, ₹0 brokerage, private chat.",
    rents: "2/3 BHK shares dominate. Entire 1 BHKs cost more per person but avoid roommate risk.",
    commute: "Outer Ring Road vs metro access. Campus shuttles change the math.",
    who: "IT, pharma, and consulting joiners on the west corridor.",
  },
  {
    city: "Chennai",
    aliases: ["madras"],
    tagline: "OMR and south Chennai rooms",
    intro:
      "Chennai (Madras) IT seekers type “OMR flatmates” and get a 20 km corridor. We split Velachery, Anna Nagar, Porur, and OMR so you can search a real micro-market.",
    rents: "OMR kilometre markers change price more than “Chennai average”.",
    commute: "ITRs and buses along OMR; rain days punish false “20 minutes” claims.",
    who: "IT and manufacturing professionals plus students near south campuses.",
  },
  {
    city: "Kolkata",
    aliases: ["calcutta"],
    tagline: "Salt Lake, New Town, central Kolkata",
    intro:
      "Kolkata (Calcutta) flatmates still cluster in Salt Lake and New Town, with central pockets near Park Street. We list peer-to-peer rooms and flats with lifestyle matching — not classified phone dumps.",
    rents: "Salt Lake vs New Town vs Howrah are different budgets. Confirm brokerage is actually zero (it is, here).",
    commute: "East Metro / buses. New Town last-mile is the usual surprise.",
    who: "IT, education, and central-Kolkata office workers.",
  },
  {
    city: "Ahmedabad",
    aliases: ["amdavad"],
    tagline: "SG Highway and west Ahmedabad shares",
    intro:
      "Ahmedabad is a formal Indian metro with strong room-share demand on SG Highway, Prahlad Nagar, and Satellite. Jain/veg kitchens are common non-negotiables — they are first-class filters here.",
    rents: "West-side high-rises vs older east pockets. Deposit customs are society-specific.",
    commute: "BRTS/metro + SG Highway traffic. Pin the actual office park.",
    who: "Professionals joining Ahmedabad corporate and startup offices.",
  },
  {
    city: "Surat",
    aliases: [],
    tagline: "Vesu and Adajan room shares",
    intro:
      "Surat is a million-plus metro with Vesu/Adajan growth. Diamond and textile professionals search “flat” and “flatmates” here the same way IT cities do — we cover it with dedicated pages.",
    rents: "South Surat newer inventory vs Adajan family societies.",
    commute: "River crossings and ring roads; time the trip at shift change.",
    who: "Trade, manufacturing, and service-sector movers into Surat.",
  },
  {
    city: "Jaipur",
    aliases: [],
    tagline: "Malviya Nagar and Vaishali Nagar",
    intro:
      "Jaipur metro-city room shares sit in Malviya Nagar, Vaishali Nagar, and Jagatpura. Students and first-job professionals need diet and guest rules in writing — chat stays on Flatmates.co.in.",
    rents: "South Jaipur vs west colonies differ; tourist-centre noise is a real filter.",
    commute: "Metro + Pink Line adjacent pockets. Sitapura jobs are not Malviya Nagar.",
    who: "Students, tourism, and BPO/IT joiners.",
  },
  {
    city: "Lucknow",
    aliases: [],
    tagline: "Gomti Nagar professional living",
    intro:
      "Lucknow’s Gomti Nagar, Hazratganj, and Aliganj are the usual flatmate triangles. We treat Lucknow as a full metro target with locality URLs Google can index.",
    rents: "Gomti Nagar premiums vs Aliganj. Always add generator/water reality.",
    commute: "Gomti bridges at peak. Pin office on the correct bank.",
    who: "IT, consulting, and government-adjacent professionals.",
  },
  {
    city: "Kanpur",
    aliases: [],
    tagline: "Civil Lines and south Kanpur flats",
    intro:
      "Kanpur is a million-plus metro. Civil Lines, Swaroop Nagar, and Kidwai Nagar carry most structured room-share demand for students and working professionals.",
    rents: "Older apartments dominate; inspect water and lift before deposit.",
    commute: "Mall Road / south Kanpur arterials. Industrial jobs need a pin, not “Kanpur”.",
    who: "IIT/college-adjacent and private-job movers.",
  },
  {
    city: "Nagpur",
    aliases: [],
    tagline: "MIHAN and central Nagpur",
    intro:
      "Nagpur MIHAN, Dharampeth, and Wardha Road are the searches that matter. Flatmates.co.in gives Nagpur its own city URL instead of burying it under “Maharashtra rooms”.",
    rents: "MIHAN new inventory vs central older stock.",
    commute: "Airport/SEZ vs city centre are opposite directions at peak.",
    who: "SEZ, aviation, and city-office joiners.",
  },
  {
    city: "Indore",
    aliases: [],
    tagline: "Vijay Nagar commercial hub",
    intro:
      "Indore’s Vijay Nagar, Palasia, and Scheme 54 are the default “find a flat / flatmate” map for central India’s commercial capital.",
    rents: "Scheme apartments vs older Palasia. Compare furnishing honestly.",
    commute: "AB Road / MR 10. Pin the actual commercial complex.",
    who: "Startup, education, and corporate joiners.",
  },
  {
    city: "Bhopal",
    aliases: [],
    tagline: "MP Nagar and Arera Colony",
    intro:
      "Bhopal room shares concentrate on MP Nagar, Arera Colony, and Kolar. We index Bhopal as a metro city for people searching flats and flatmates without brokers.",
    rents: "Arera premiums vs Kolar newer stock.",
    commute: "Lake-city geography means wrong-side-of-town listings waste an hour.",
    who: "Government, education, and private-office movers.",
  },
  {
    city: "Kochi",
    aliases: ["cochin", "ernakulam"],
    tagline: "Infopark, Kakkanad, Edappally",
    intro:
      "Kochi (Cochin) IT living is Kakkanad / Infopark / Edappally. Rain, last-mile autos, and apartment associations shape daily life more than listing photos.",
    rents: "Infopark-adjacent premiums. Confirm association guest rules.",
    commute: "Seaport-airport road vs metro. Late Infopark shifts need a plan.",
    who: "IT professionals moving to Kochi campuses.",
  },
  {
    city: "Coimbatore",
    aliases: ["kovai"],
    tagline: "Peelamedu and Saravanampatti IT",
    intro:
      "Coimbatore (Kovai) flatmates cluster in Peelamedu, Saravanampatti, and RS Puram — college plus IT park demand on one map.",
    rents: "North IT vs west-central older houses.",
    commute: "Avinashi Road traffic. Pin Tidel/park, not “Coimbatore”.",
    who: "Engineering college and IT park joiners.",
  },
  {
    city: "Chandigarh",
    aliases: ["tricity", "mohali", "panchkula"],
    tagline: "Sectors plus Mohali IT City",
    intro:
      "Chandigarh searches often mean Mohali or Panchkula in practice. We list Sector 17, Sector 35, and Mohali so “Chandigarh flatmates” lands on real inventory areas.",
    rents: "UT sectors are tight; Mohali usually has more 2 BHK shares.",
    commute: "Tricity roads. IT City Mohali is not Sector 17.",
    who: "IT, student, and government-adjacent movers in the tricity.",
  },
  {
    city: "Visakhapatnam",
    aliases: ["vizag", "vishakhapatnam"],
    tagline: "Madhurawada and Rushikonda IT",
    intro:
      "Visakhapatnam (Vizag) IT seekers look at Madhurawada, Rushikonda, and Gajuwaka. Dedicated locality pages beat a single “Andhra rooms” dump.",
    rents: "Hill/IT side vs industrial south are different markets.",
    commute: "Beach road vs NH. Monsoon hill traffic is real.",
    who: "SEZ and plant professionals.",
  },
  {
    city: "Patna",
    aliases: [],
    tagline: "Boring Road and Kankarbagh",
    intro:
      "Patna metro-city room shares sit on Boring Road, Kankarbagh, and Bailey Road. Direct tenant/owner listings, ₹0 brokerage.",
    rents: "Central premiums vs outer colonies. Inspect water before depositing.",
    commute: "Bailey / Boring congestion. Pin the actual office.",
    who: "Education, government, and private-job movers.",
  },
  {
    city: "Bhubaneswar",
    aliases: ["bhubaneshwar"],
    tagline: "Patia and Infocity",
    intro:
      "Bhubaneswar Infocity, Patia, and Chandrasekharpur are the IT flatmate map. We index them as crawlable URLs.",
    rents: "Infocity-adjacent vs quieter Chandrasekharpur.",
    commute: "Chandaka / Infocity last-mile. Pin building, not “Bhubaneswar”.",
    who: "IT and government-capital joiners.",
  },
  {
    city: "Thiruvananthapuram",
    aliases: ["trivandrum", "tvm"],
    tagline: "Technopark living",
    intro:
      "Thiruvananthapuram (Trivandrum) flatmates searches are mostly Technopark / Kazhakkoottam, with Pattom for people who want city amenities.",
    rents: "Technopark walkability premiums. Confirm association rules.",
    commute: "NH bypass vs city. Late Technopark buses matter.",
    who: "Technopark and government-city professionals.",
  },
  {
    city: "Guwahati",
    aliases: ["gauhati"],
    tagline: "GS Road and Dispur",
    intro:
      "Guwahati is the Northeast metro for flat and flatmate search: Zoo Road, Dispur, Six Mile. Lifestyle matching still applies — veg kitchens and guest rules included.",
    rents: "GS Road growth vs older central stock.",
    commute: "Hills and GS Road jams. Pin the actual office.",
    who: "Private-job and government movers into Guwahati.",
  },
  {
    city: "Vadodara",
    aliases: ["baroda"],
    tagline: "Alkapuri and Gotri",
    intro:
      "Vadodara (Baroda) room shares in Alkapuri, Gotri, and Akota serve Gujarat’s industrial-professional mix with the same ₹0 brokerage product.",
    rents: "Alkapuri vs Gotri newer societies.",
    commute: "West Vadodara vs plant belts. Pin workplace.",
    who: "Engineering, manufacturing, and services professionals.",
  },
  {
    city: "Mysuru",
    aliases: ["mysore"],
    tagline: "Vijayanagar and Hebbal",
    intro:
      "Mysuru (Mysore) flatmates demand follows campuses and Infosys-adjacent pockets: Vijayanagar, Gokulam, Hebbal.",
    rents: "Usually below Bengaluru for similar BHK. Still confirm deposit.",
    commute: "North vs west Mysuru. Pin campus.",
    who: "Students and IT-campus joiners who want a smaller metro than Bengaluru.",
  },
  {
    city: "Nashik",
    aliases: ["nasik"],
    tagline: "College Road and Satpur MIDC",
    intro:
      "Nashik (Nasik) is a million-plus city with College Road, Gangapur Road, and Satpur room shares for students and MIDC professionals.",
    rents: "West growth vs central older houses.",
    commute: "MIDC vs city centre are different directions.",
    who: "Manufacturing, education, and services movers.",
  },
  {
    city: "Ranchi",
    aliases: [],
    tagline: "Harmu, Doranda, Kanke",
    intro:
      "Ranchi flat and flatmate searches land in Harmu, Doranda, and Kanke. Dedicated pages keep Jharkhand’s capital in Google’s city map for our product.",
    rents: "Central vs Kanke quieter outskirts.",
    commute: "Hilly last-mile. Pin office.",
    who: "Government, mining-adjacent, and private-job movers.",
  },
  {
    city: "Raipur",
    aliases: [],
    tagline: "Telibandha and Shankar Nagar",
    intro:
      "Raipur’s Telibandha, Shankar Nagar, and Amapara cover Chhattisgarh’s capital room-share market.",
    rents: "Lake-side commercial vs residential colonies.",
    commute: "GE Road / ring. Pin the actual office park.",
    who: "Capital-city professionals and students.",
  },
  {
    city: "Dehradun",
    aliases: ["dehra dun"],
    tagline: "Rajpur Road and IT Park",
    intro:
      "Dehradun room shares along Rajpur Road, IT Park, and Prem Nagar serve students and hill-city professionals searching for a flat or flatmate.",
    rents: "Rajpur premiums vs west Dehradun.",
    commute: "Hill roads; monsoon changes ETAs. Pin workplace.",
    who: "Education, IT Park, and government-adjacent movers.",
  },
  {
    city: "Mangaluru",
    aliases: ["mangalore"],
    tagline: "Kadri and Bejai",
    intro:
      "Mangaluru (Mangalore) hospital and IT joiners search Kadri, Bejai, and Pumpwell. We index the city so “Mangalore flatmates” is not a dead end.",
    rents: "Central vs junction-side. Confirm PG-vs-flat rules.",
    commute: "NH66 / city junctions. Pin hospital or office.",
    who: "Healthcare, port, and IT professionals.",
  },
  {
    city: "Ludhiana",
    aliases: [],
    tagline: "Sarabha Nagar and Ferozepur Road",
    intro:
      "Ludhiana is Punjab’s industrial metro. Sarabha Nagar, BRS Nagar, and Ferozepur Road carry most structured room-share demand.",
    rents: "Colony premiums vs arterial commercial noise.",
    commute: "Ferozepur Road peak. Pin factory or office.",
    who: "Industry and services professionals.",
  },
  {
    city: "Amritsar",
    aliases: [],
    tagline: "Ranjit Avenue and Lawrence Road",
    intro:
      "Amritsar room shares in Ranjit Avenue, Lawrence Road, and Mall Road serve people who searched for a flat or flatmate in Punjab’s historic metro.",
    rents: "Planned Ranjit Avenue vs noisier centre.",
    commute: "GT Road / city centre. Pin workplace.",
    who: "Hospitality, trade, and private-job movers.",
  },
  {
    city: "Vijayawada",
    aliases: ["bezawada"],
    tagline: "Benz Circle living",
    intro:
      "Vijayawada (Bezawada) flatmates searches centre on Benz Circle, Gurunanak Colony, and Auto Nagar.",
    rents: "Central junction premiums vs outer colonies.",
    commute: "Krishna bridges at peak. Pin office.",
    who: "Students, rail/road logistics, and private-job movers.",
  },
  {
    city: "Madurai",
    aliases: [],
    tagline: "Anna Nagar and KK Nagar",
    intro:
      "Madurai metro-city room shares in Anna Nagar, KK Nagar, and Goripalayam — indexed for people searching flats and flatmates in south Tamil Nadu’s largest city.",
    rents: "North planned vs old-city noise.",
    commute: "Temple-city traffic. Pin workplace or college.",
    who: "Education, healthcare, and services professionals.",
  },
  {
    city: "Rajkot",
    aliases: [],
    tagline: "Kalawad Road and University Road",
    intro:
      "Rajkot room shares along Kalawad Road, University Road, and the 150 Feet Ring Road cover Gujarat’s Saurashtra metro.",
    rents: "West growth vs student-heavy university belt.",
    commute: "Ring road vs university area. Pin office.",
    who: "Industry, education, and services movers.",
  },
];

export function getCitySeo(city: string): CitySeo | undefined {
  return CITY_SEO.find((c) => c.city.toLowerCase() === city.toLowerCase());
}

export function getHub(city: string, locality: string): Hub | undefined {
  return HUBS.find((h) => h.city === city && h.locality === locality);
}

const NEIGHBOR_GROUPS: string[][] = [
  ["Delhi", "Gurugram", "Noida", "Ghaziabad", "Faridabad"],
  ["Mumbai", "Navi Mumbai", "Pune", "Nashik"],
  ["Bengaluru", "Mysuru", "Chennai", "Hyderabad", "Coimbatore"],
  ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  ["Jaipur", "Delhi", "Ahmedabad"],
  ["Lucknow", "Kanpur", "Patna"],
  ["Indore", "Bhopal", "Nagpur"],
  ["Kochi", "Thiruvananthapuram", "Coimbatore", "Chennai"],
  ["Chandigarh", "Ludhiana", "Amritsar", "Dehradun"],
  ["Hyderabad", "Vijayawada", "Visakhapatnam", "Bengaluru"],
  ["Kolkata", "Bhubaneswar", "Patna", "Ranchi"],
  ["Guwahati", "Patna", "Kolkata"],
  ["Mangaluru", "Bengaluru", "Mysuru", "Kochi"],
  ["Raipur", "Nagpur", "Bhopal", "Ranchi"],
  ["Madurai", "Chennai", "Coimbatore", "Thiruvananthapuram"],
];

export function neighborCities(city: string): string[] {
  const set = new Set<string>();
  for (const group of NEIGHBOR_GROUPS) {
    if (group.includes(city)) {
      for (const c of group) {
        if (c !== city && CITIES.includes(c)) set.add(c);
      }
    }
  }
  return Array.from(set).slice(0, 6);
}

/** slug (and common nicknames) → canonical city name used in URLs */
export const CITY_ALIAS_TO_CANONICAL: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const row of CITY_SEO) {
    for (const a of row.aliases) {
      map[a.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")] = row.city;
    }
  }
  return map;
})();
