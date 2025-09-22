
# Code reviewr

A web application that allows developers to submit code snippets for AI-powered review and feedback

## Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- shadcn/ui components
- Tailwind CSS

### Backend
- FastAPI
- Python 3.13
- MongoDB
- OpenAI API
- SlowAPI (rate limiting)

## Usage

    1. Navigate to the application URL
    2. Paste your code snippet in the editor
    3. Select the programming language
    4. Click in the arrow
    5. View AI-generated feedback and suggestions
## Installation

### Frontend

Create a dotenv file in the frontend directory with this variables:
#### Frontend Environment Variables

```bash
VITE_API_URL=your_backend_url_here
VITE_TOKEN=your_auth_token_here
```

Now install and run the frontend:

```bash
  cd frontend/
  npm install 
  npm run dev
```

### Backend

Create a dotenv file in the backend directory with this variables:

#### Backend Environment Variables
```bash 
MONGODB_URL=your_mongodb_connection_string
MONGODB_PASSWORD=your_mongodb_password
OPENAI_API_KEY=your_openai_api_key
SECRET_TOKEN=your_jwt_secret_token
```

I recomend to use a virtual enviroment in the python backend:

```bash
virtualenv venv
.\venv\Scripts\activate
```

Then install the python packages and run the code:

```bash 
pip install -r .\requirements.txt
fastapi dev main.py 
```

## Deployment

This project is deployed in vercel(frontend) and render(backend).

This is the frontend link: https://code-review-pef6envki-joaos-projects-d87a7fa1.vercel.app


This is the backend link: https://codereview-ytlp.onrender.com



## API Reference

Key endpoints:
- `POST /api/reviews` - Submit code for review
- `GET /api/reviews/{id}` - Get review results
- `GET /api/health` - Get system health
- `GET /api/stats` - Get syste statistcs

Full documentation available at: https://codereview-ytlp.onrender.com/docs
## Documentation

### Architecture Decisions
#### Backend Framework: FastAPI with SlowAPI
Why: FastAPI provides modern Python web framework features with automatic OpenAPI documentation, type hints, and excellent performance. SlowAPI integrates seamlessly for rate limiting needs.

Benefits: Async/await support, automatic API documentation, and strong validation through Pydantic models.

#### Database: MongoDB with Async PyMongo
Why: MongoDB's flexible document model works well for varying data structures in URL shortening. The new async PyMongo driver provides non-blocking database operations.

Benefits: Horizontal scaling capabilities, flexible schema, and async operations that complement FastAPI's async nature.

### Frontend: Vite + React + shadcn/ui
Why: Modern, fast development tooling with a component-based architecture. shadcn/ui provides pre-built, accessible components without heavy dependencies.

Benefits: Hot module replacement for faster development, tree-shaking for optimized bundles, and reusable UI components.

### Challenges Faced
#### Async PyMongo Documentation
Challenge: Limited documentation and examples for the new async functionality in PyMongo.

Solution: Extensive testing and experimentation with connection patterns, referencing MongoDB's official async documentation and community examples.

#### FastAPI Learning Curve
Challenge: First-time implementation of FastAPI for production-like scenarios.

Solution: Leveraged FastAPI's excellent documentation, focused on dependency injection patterns, and implemented middleware for cross-cutting concerns.

#### Frontend State Management
Challenge: Managing URL shortening state, loading states, and error handling across components.

Solution: Implemented React hooks for state management and context API for shared state where appropriate.

### Scalability Considerations
#### Current Implementation
Rate limiting per IP/user to prevent abuse

Async operations to handle concurrent requests efficiently

MongoDB indexing on frequently queried fields (short codes, user IDs)

#### Future Scalability Needs
Queue System: Implement Redis or RabbitMQ for background URL processing

Caching Layer: Redis for frequently accessed URLs to reduce database load

Load Balancing: Multiple backend instances behind a load balancer

Database Sharding: Distribute URL data across multiple MongoDB shards

CDN Integration: Cache static assets and frequently accessed shortened URLs

### Improvements with More Time
#### Backend Enhancements
Implement user authentication and authorization

Add comprehensive unit and integration tests

Create API versioning strategy

Implement proper error handling and logging

Add URL analytics and tracking features

#### Frontend Improvements
Implement client-side routing with React Router

Add proper form validation and user feedback

Create responsive design for mobile devices

Implement dark/light theme switching

Add URL management dashboard with edit/delete functionality

#### Infrastructure
Docker containerization for easy deployment

CI/CD pipeline for automated testing and deployment

Environment-based configuration management

Health check endpoints and monitoring

### Trade-offs Due to Time Constraints
#### Architecture Trade-offs
Single Page Application: No client-side routing implemented

No Authentication: User validation and session management skipped

Basic Rate Limiting: Simple IP-based limiting without user differentiation

#### Code Quality Trade-offs
Limited Error Handling: Basic exception handling without comprehensive coverage

Minimal Testing: No unit tests implemented

Monolithic Structure: Backend routes not separated into modular routers

#### Feature Trade-offs
No Analytics: URL click tracking and statistics not implemented

Basic UI/UX: Minimal styling and user experience polish

No Admin Features: Lack of administrative dashboard or moderation tools

