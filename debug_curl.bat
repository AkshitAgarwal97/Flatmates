curl -X POST http://localhost:5000/api/properties ^
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NGZjMTc3YzgxZjkwMzA2MjU1NjQ5MSIsInVzZXJUeXBlIjoicm9vbV9zZWVrZXIiLCJpYXQiOjE3NjY4MzQ1NTIsImV4cCI6MTc2NzQzOTM1Mn0.vaZRiaWSM259UcB5dT1BDY1B1_ZtEctu_opglrknG_E" ^
-F "title=Curl Verification Property" ^
-F "description=Verification of backend listingType fix." ^
-F "propertyType=apartment" ^
-F "listingType=entire_property" ^
-F "price={\"amount\": 3000}" ^
-F "address={\"street\":\"123 Verified St\",\"city\":\"New York\",\"state\":\"NY\",\"zipCode\":\"10001\",\"country\":\"USA\"}" ^
-F "availability={\"availableFrom\":\"2026-01-01\"}"
