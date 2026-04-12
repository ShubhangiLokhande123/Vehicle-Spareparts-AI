# spareparts.ai 🚗

**spareparts.ai** is an intelligent vehicle and spare parts identification platform. By leveraging advanced computer vision and generative AI, the application allows users to identify vehicles and their specific components simply by uploading a photo, streamlining the process of finding compatible replacement parts.

🔗 **Live Website**: [spareparts.ai on GitHub Pages/Vercel (Update link when deployed)](https://github.com/ShubhangiLokhande123/Vehicle-Spareparts-AI)

## 🎯 Objective

The primary goal of spareparts.ai is to bridge the gap between visual identification and technical specifications in the automotive industry. It aims to help vehicle owners, mechanics, and parts retailers quickly identify exact vehicle generations and find the correct, compatible spare parts without needing to manually search through complex catalogs or decode VIN numbers.

## ✨ Key Features

- **AI Vehicle Identification**: Upload a photo of any vehicle to identify its Make, Model, Year Range, and Variant with high confidence using Google Gemini Vision AI.
- **Visual Part Recognition**: Identify specific spare parts (e.g., brake pads, oil filters, spark plugs) from images and get detailed technical descriptions.
- **Compatibility Engine**: Automatically matches identified vehicles with a database of compatible parts from a master catalog.
- **Identification History & Virtual Garage**: Keep track of all previously identified vehicles and parts for quick reference.
- **Saved Parts**: Star and save specific parts to a personalized list for easy access later.
- **Multi-Mode Scanning**: Switch between "Vehicle Mode" for full car identification and "Part Mode" for component-level scanning.
- **Demo/Mock Mode**: A built-in fail-safe mode that allows users to explore the application's features using mocked data even when API keys or database connectivity is limited.
- **Secure Authentication**: User accounts, Google OAuth, and data persistence powered by Supabase.
- **Fully Responsive UI**: Modern, clean, and responsive design built with Tailwind CSS via NativeWind, adapting beautifully to different screen sizes.

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Styling**: Tailwind CSS / NativeWind for a modern, responsive mobile-first UI
- **AI Engine**: Google Gemini (Generative AI 2.5 Flash) for multimodal image analysis and structured data extraction
- **Backend/Database**: Supabase (PostgreSQL) for user data and parts catalog
- **Storage**: Supabase Storage for vehicle and part image hosting
- **Language**: TypeScript

## 🚀 How It Works

1. **Capture/Upload**: The user takes a photo or uploads an existing image of a vehicle or a specific part.
2. **AI Analysis**: The image is processed by the Gemini AI model using custom prompts designed to extract structured automotive data.
3. **Structured Response**: The AI returns detailed specifications (Make, Model, SKU, etc.) which are then validated against the internal database.
4. **Database Matching**: For vehicles, the app queries a compatibility matrix to suggest a list of parts that are guaranteed to fit that specific generation.
5. **Persistence**: Results are saved to the user's profile, allowing them to access their "virtual garage" of identified vehicles at any time.

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- A Supabase project
- A Gemini AI API Key

### Environment Variables
Create a `.env` file in the root directory (based on `.env.example`) and add the following:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Database Setup
Execute the provided `database.sql` script in your Supabase SQL Editor to set up the necessary tables, RLS policies, and the `get_parts_for_vehicle` RPC function.

### Running Locally
```bash
npm install
npm run android # Or npm run ios / npm run web
```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
