# FRIDAY AI Assistant

A sophisticated AI assistant inspired by Iron Man's FRIDAY, featuring a beautiful floating orb interface with voice recognition, ChatGPT integration, and ElevenLabs text-to-speech.

![FRIDAY AI Assistant](https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop)

## Features

- 🎯 **Floating Orb Interface** - Beautiful animated orb with dynamic states
- 🎤 **Voice Recognition** - Speak naturally to interact with FRIDAY
- 🧠 **ChatGPT Integration** - Powered by OpenAI's GPT-4o-mini for intelligent responses
- 🔊 **Text-to-Speech** - Natural female voice using ElevenLabs
- ✨ **Smooth Animations** - State-based animations (idle, listening, thinking, speaking)
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Glass-morphism effects with Iron Man-inspired theme

## Demo

The orb responds to different states:
- **Idle**: Gentle pulsing with blue gradient
- **Listening**: Pulsing blue animation while capturing voice
- **Thinking**: Spinning cyan animation while processing
- **Speaking**: Bouncing purple animation with particle effects

## Setup

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- ElevenLabs API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/friday-ai-assistant.git
cd friday-ai-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_VOICE_ID=your_voice_id_here
```

### Getting API Keys

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the key to your `.env` file

#### ElevenLabs API Key
1. Visit [ElevenLabs](https://elevenlabs.io/app/settings/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the key to your `.env` file
5. Optionally, get a specific voice ID from the Voice Library

### Running the Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

## Usage

1. **Click the orb** to start listening
2. **Speak your question** or command
3. **Watch FRIDAY process** your request (spinning animation)
4. **Listen to the response** with visual speaking animation
5. **View conversation history** below the orb

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Safari
- ✅ Edge
- ❌ Firefox (limited speech recognition support)

## Technologies Used

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **OpenAI API** - GPT-4o-mini for responses
- **ElevenLabs API** - Text-to-speech conversion
- **Web Speech API** - Browser speech recognition
- **Lucide React** - Beautiful icons

## Project Structure

```
src/
├── components/          # React components
│   ├── Orb.tsx         # Main floating orb component
│   ├── StatusDisplay.tsx
│   ├── MessageHistory.tsx
│   └── SetupInstructions.tsx
├── hooks/              # Custom React hooks
│   └── useVoiceAssistant.ts
├── utils/              # Utility functions
│   ├── openai.ts       # OpenAI API integration
│   ├── elevenlabs.ts   # ElevenLabs API integration
│   └── speechRecognition.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── App.tsx             # Main application component
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Iron Man's FRIDAY AI assistant
- Built with modern web technologies
- Powered by OpenAI and ElevenLabs APIs

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/friday-ai-assistant/issues) on GitHub.