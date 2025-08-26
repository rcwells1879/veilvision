# VeilVision

An AI-powered image transformation webapp that uses Google's Gemini 2.5 Flash Vision API to remix and transform photos based on user prompts.

## Features

- **Image Upload & Transformation**: Upload photos and transform them with AI using natural language prompts
- **Professional Interface**: Clean, intuitive dashboard with sidebar navigation
- **User Authentication**: Secure authentication powered by Clerk
- **Generation History**: Track all your image transformations and their results
- **Gallery View**: Browse and manage your generated images
- **Settings Management**: Configure API keys, preferences, and account settings

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Neon (PostgreSQL)
- **AI**: Google Gemini 2.5 Flash Vision API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Clerk account for authentication
- A Neon database instance
- A Google AI Studio API key for Gemini

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd veilvision
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables by copying `.env.local`:
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Neon Database
DATABASE_URL=your_neon_database_url_here

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # Main dashboard page
│   ├── settings/           # User settings page
│   ├── gallery/            # Generated images gallery
│   ├── history/            # Generation history
│   ├── layout.tsx          # Root layout with sidebar
│   └── page.tsx            # Home page (redirects to dashboard)
├── components/
│   └── Sidebar.tsx         # Navigation sidebar component
└── lib/
    ├── database.ts         # Neon database configuration
    └── gemini.ts           # Gemini 2.5 Flash Vision API service
```

## API Configuration

### Gemini 2.5 Flash Vision

This app uses the `gemini-2.5-flash-image-preview` model for image generation and transformation. Get your API key from [Google AI Studio](https://aistudio.google.com/).

### Database Schema

The app expects the following database tables:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL,
    display_name VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Generations table
CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    original_filename VARCHAR NOT NULL,
    prompt TEXT NOT NULL,
    result_url VARCHAR,
    status VARCHAR CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Development

- **Dashboard**: Main interface for uploading images and entering transformation prompts
- **Settings**: Configure API keys, preferences, and view account information
- **Gallery**: Browse and manage generated images
- **History**: View generation history with status tracking

## Contributing

This is a skeleton application structure. To complete the implementation:

1. Set up the database schema in Neon
2. Configure Clerk authentication
3. Add the Gemini API key
4. Test the image transformation functionality
5. Add error handling and loading states
6. Implement file storage for generated images

## License

MIT License
