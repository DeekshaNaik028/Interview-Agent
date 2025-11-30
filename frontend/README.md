# Interview Agent System - Frontend

AI-powered interview platform with voice-based assessment.

## Features

- 🎥 Real-time video/audio recording
- 🤖 AI-generated interview questions
- 📊 Automated evaluation system
- 👥 Separate dashboards for candidates and companies
- 🔐 Secure authentication

## Tech Stack

- React 18
- Vite
- Redux Toolkit
- React Router v6
- Axios
- RecordRTC
- React Webcam

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── api/           # API services
├── components/    # React components
├── pages/         # Page components
├── hooks/         # Custom hooks
├── context/       # React context
├── store/         # Redux store
├── utils/         # Utilities
└── styles/        # Global styles
```

## Environment Variables

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_MAX_VIDEO_SIZE_MB` - Max video size
- `VITE_MAX_AUDIO_SIZE_MB` - Max audio size

## License

MIT