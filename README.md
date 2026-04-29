# VEGA-CY Full Stack

## Frontend
```bash
cd frontend
npm install
npm run dev
```
Open: http://localhost:5173

## Backend API + Swagger
```bash
cd backend/VegaCy.Api
dotnet restore
dotnet run
```
Swagger: http://localhost:5000/swagger

## Features
- React Vite frontend
- ASP.NET Core 8 backend
- Swagger
- API endpoints:
  - GET /api/works
  - POST /api/works
  - DELETE /api/works/{id}
  - POST /api/uploads
- Dashboard adds images/videos using API
- Uploaded files stored in backend/wwwroot/uploads
- Data stored in backend/VegaCy.Api/Data/works.json
