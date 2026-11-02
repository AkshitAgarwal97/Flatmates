/** @type {import('next').NextConfig} */

const cityAliases = [
  ["bangalore", "bengaluru"],
  ["bengalooru", "bengaluru"],
  ["bombay", "mumbai"],
  ["new-mumbai", "navi-mumbai"],
  ["new-delhi", "delhi"],
  ["delhi-ncr", "delhi"],
  ["gurgaon", "gurugram"],
  ["poona", "pune"],
  ["madras", "chennai"],
  ["calcutta", "kolkata"],
  ["amdavad", "ahmedabad"],
  ["cochin", "kochi"],
  ["ernakulam", "kochi"],
  ["kovai", "coimbatore"],
  ["tricity", "chandigarh"],
  ["vizag", "visakhapatnam"],
  ["vishakhapatnam", "visakhapatnam"],
  ["bhubaneshwar", "bhubaneswar"],
  ["trivandrum", "thiruvananthapuram"],
  ["tvm", "thiruvananthapuram"],
  ["gauhati", "guwahati"],
  ["baroda", "vadodara"],
  ["mysore", "mysuru"],
  ["nasik", "nashik"],
  ["dehra-dun", "dehradun"],
  ["mangalore", "mangaluru"],
  ["bezawada", "vijayawada"],
];

const nextConfig = {
  // Standalone on Linux/Vercel/Oracle. Skip on Windows: Next 14 tracing can miss nft.json there.
  ...(process.env.NEXT_OUTPUT === "standalone" || process.platform !== "win32"
    ? { output: "standalone" }
    : {}),
  poweredByHeader: false,
  async redirects() {
    const intentPrefixes = ["apartments", "houses", "rooms", "rent", "pg"];
    const city = cityAliases.flatMap(([from, to]) => [
      { source: `/flatmates/${from}`, destination: `/flatmates/${to}`, statusCode: 301 },
      { source: `/flatmates/${from}/:path*`, destination: `/flatmates/${to}/:path*`, statusCode: 301 },
      ...intentPrefixes.map((p) => ({
        source: `/${p}/${from}`,
        destination: `/flatmates/${to}`,
        statusCode: 301,
      })),
      {
        source: `/roommates/${from}`,
        destination: `/flatmates/${to}`,
        statusCode: 301,
      },
    ]);
    const intentCity = intentPrefixes.flatMap((p) => [
      { source: `/${p}/:city`, destination: `/flatmates/:city`, statusCode: 301 },
      { source: `/${p}/:city/:locality`, destination: `/flatmates/:city/:locality`, statusCode: 301 },
    ]);
    return [
      { source: "/flats", destination: "/flat", statusCode: 301 },
      { source: "/apartment", destination: "/apartments", statusCode: 301 },
      { source: "/apartment-for-rent", destination: "/apartments", statusCode: 301 },
      { source: "/apartments-for-rent", destination: "/apartments", statusCode: 301 },
      { source: "/flat-for-rent", destination: "/flat", statusCode: 301 },
      { source: "/house", destination: "/houses", statusCode: 301 },
      { source: "/house-for-rent", destination: "/houses", statusCode: 301 },
      { source: "/houses-for-rent", destination: "/houses", statusCode: 301 },
      { source: "/room-for-rent", destination: "/rooms", statusCode: 301 },
      { source: "/rooms-for-rent", destination: "/rooms", statusCode: 301 },
      { source: "/place-to-rent", destination: "/rent", statusCode: 301 },
      { source: "/rental", destination: "/rent", statusCode: 301 },
      { source: "/rentals", destination: "/rent", statusCode: 301 },
      { source: "/accommodation", destination: "/rent", statusCode: 301 },
      { source: "/roommate", destination: "/roommates", statusCode: 301 },
      { source: "/find-roommate", destination: "/roommates", statusCode: 301 },
      { source: "/find-roommates", destination: "/roommates", statusCode: 301 },
      { source: "/housemates", destination: "/roommates", statusCode: 301 },
      { source: "/roommates/:city", destination: "/flatmates/:city", statusCode: 301 },
      { source: "/roommates/:city/:locality", destination: "/flatmates/:city/:locality", statusCode: 301 },
      { source: "/paying-guest", destination: "/pg", statusCode: 301 },
      { source: "/pg-accommodation", destination: "/pg", statusCode: 301 },
      { source: "/hindi", destination: "/hi", statusCode: 301 },
      ...city,
      ...intentCity,
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https:",
              "frame-src https://www.openstreetmap.org",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
