# API Integration Documentation

## Overview

This application has been refactored to fetch mentor data from a backend API instead of using hardcoded mock data. The implementation includes proper error handling, loading states, and fallback mechanisms.

## Architecture

### 1. **MentorService** (`src/services/mentorService.ts`)

- Handles all API communication with the backend
- Provides fallback to mock data when API is unavailable
- Supports filtering and search parameters
- Type-safe with proper TypeScript interfaces

### 2. **useMentors Hook** (`src/hooks/useMentors.ts`)

- Custom React hook that manages mentor fetching state
- Handles loading, error, and success states
- Debounces search queries to prevent excessive API calls
- Automatically categorizes mentors into recommended/other sections

### 3. **useDebounce Hook** (`src/hooks/useDebounce.ts`)

- Utility hook to debounce search input
- Prevents API calls on every keystroke
- 300ms delay by default

## API Endpoints

### GET /api/mentors

Fetch mentors with optional filtering.

**Query Parameters:**

- `search` (string): Search term for name, title, company, or expertise
- `expertise` (string): Comma-separated list of expertise areas
- `experience` (string): Comma-separated list of experience levels
- `availability` (string): Comma-separated list of availability statuses
- `interests` (string): Comma-separated list of user interests for recommendations

**Response:**

```json
{
  "mentors": [
    {
      "id": "string",
      "name": "string",
      "title": "string",
      "company": "string",
      "expertise": ["string"],
      "experience": "string",
      "rating": 4.5,
      "reviewCount": 100,
      "availability": "Available" | "Limited",
      "location": "string",
      "languages": ["string"],
      "bio": "string",
      "achievements": ["string"],
      "image": "string",
      "industry": "string"
    }
  ],
  "total": 50,
  "recommended": [/* optional recommended mentors */]
}
```

### GET /api/mentors/filter-options

Get available filter options.

**Response:**

```json
{
  "expertise": ["Software Engineering", "Data Science", ...],
  "experience": ["Junior (1-3 years)", "Senior (8-12 years)", ...],
  "availability": ["Available", "Limited"]
}
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

For production:

```env
VITE_API_BASE_URL=https://your-production-api.com/api
```

## Features

### 1. **Intelligent Fallback**

- If the API fails, the app automatically falls back to mock data
- Users see a seamless experience even when the backend is down
- Console warnings alert developers to API issues

### 2. **Search & Filtering**

- Real-time search with 300ms debouncing
- Multiple filter categories: expertise, experience, availability
- Filters are applied on the backend for better performance

### 3. **Loading States**

- Spinning loader during data fetching
- Skeleton states could be added for better UX
- Clear error messages with retry functionality

### 4. **Error Handling**

- Network error handling
- HTTP error status handling
- Graceful degradation to mock data
- User-friendly error messages with retry options

## Development

### Running with Mock Data

If you don't have a backend API yet, the app will automatically use mock data. You'll see a console warning:

```
API call failed, using mock data: [error details]
```

### Testing API Integration

1. Start your backend API on `http://localhost:3001`
2. Ensure it implements the endpoints described above
3. The app will automatically detect and use the API

### Backend Requirements

Your backend should:

1. Implement the `/api/mentors` endpoint with filtering
2. Implement the `/api/mentors/filter-options` endpoint
3. Handle CORS for your frontend domain
4. Return data in the expected format

## Future Enhancements

1. **Caching**: Implement API response caching for better performance
2. **Pagination**: Add pagination support for large mentor lists
3. **Real-time Updates**: WebSocket integration for real-time mentor availability
4. **Advanced Filtering**: Geolocation-based filtering, price ranges, etc.
5. **Offline Support**: Service worker for offline functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend allows requests from your frontend domain
2. **Network Errors**: Check if the API URL in `.env` is correct
3. **Data Format**: Ensure your backend returns data in the expected format
4. **Environment Variables**: Make sure `.env` file is in the project root and variables start with `VITE_`

### Debug Mode

Enable console logs in the mentor service to debug API calls:

```javascript
// In mentorService.ts, add logging
console.log("Fetching mentors with filters:", filters);
console.log("API Response:", data);
```
