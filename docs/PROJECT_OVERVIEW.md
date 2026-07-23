# Project Overview

Flatmates is a full‑stack web application designed to help users find and share roommate listings. It provides a platform where users can:

- **Search for available rooms or flats** based on location, price, amenities, and other criteria.
- **Create and manage property listings**, including uploading images (stored on AWS S3).
- **Communicate with potential roommates** via a real‑time messaging system.
- **Visualize listings on an interactive map** with clustering and proximity filters.
- **Enjoy a modern, responsive UI** featuring glassmorphism, dark mode, and accessibility enhancements.

The repository contains both the **frontend** (React, Redux, TypeScript) and **backend** (Node.js, Express, MongoDB) along with Docker configurations for easy local development and production deployment.

---

## Key Features

1. **Authentication & Authorization** – Secure sign‑up, login, password reset using JWT.
2. **Property Management** – CRUD operations for listings, image uploads to AWS S3.
3. **Real‑time Messaging** – Socket.io powered chat between users.
4. **Map Integration & Advanced Search** – Interactive map with clustering, filters for price, pet‑friendly, amenities, distance, etc.
5. **UI/UX Enhancements** – Glassmorphism header, dark mode, responsive design, accessibility compliance.
6. **Dockerized Deployment** – Docker Compose setups for development and production on AWS.

---

For detailed documentation of each feature, see the `docs/FEATURES.md` file.
