# Wanderlist 🌍

A full-stack **MERN travel itinerary marketplace** where travelers can discover and purchase curated travel itineraries created by experienced travelers.

## ✨ Features

* 🔐 Secure JWT authentication with access & refresh tokens
* 🗺️ Browse, search, and filter itineraries
* 🛒 Purchase and manage itinerary orders
* ⭐ Review and rate purchased itineraries
* 📧 Email notifications for key user actions
* ⚡ Full-text search with MongoDB text indexes
* 📊 Optimized aggregate ratings for fast listing performance

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Authentication:** JWT, HttpOnly Refresh Cookies, bcrypt
* **Other:** Nodemailer

## 🚀 Highlights

* 20+ RESTful API endpoints
* Dual-token authentication with refresh token rotation
* MongoDB text search and advanced filtering
* Database-enforced review uniqueness
* Optimized queries using `Promise.all`
* Production-style backend architecture

## 📦 Getting Started

```bash
git clone <repository-url>
cd Wanderlist
npm install
```

Create a `.env` file with the required environment variables, then run:

```bash
npm run dev
```

## 📄 License

This project is for learning and portfolio purposes.
