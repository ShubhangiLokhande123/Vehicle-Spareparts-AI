# spareparts.ai 🚗

**spareparts.ai** is an intelligent vehicle and spare parts identification platform. By leveraging advanced computer vision and generative AI, the application allows users to identify vehicles and their specific components simply by uploading a photo, streamlining the process of finding compatible replacement parts.

## 🎯 Objective

The primary goal of spareparts.ai is to bridge the gap between visual identification and technical specifications in the automotive industry. It aims to help vehicle owners, mechanics, and parts retailers quickly identify exact vehicle generations and find the correct, compatible spare parts without needing to manually search through complex catalogs or decode VIN numbers.

## ✨ Key Features

- **AI Vehicle Identification**: Upload a photo of any vehicle to identify its Make, Model, Year Range, and Variant with high confidence.
- **Visual Part Recognition**: Identify specific spare parts (e.g., brake pads, oil filters, spark plugs) from images and get detailed technical descriptions.
- **Compatibility Engine**: Automatically matches identified vehicles with a database of compatible parts from a master catalog.
- **Identification History**: Keep track of all previously identified vehicles and parts for quick reference.
- **Multi-Mode Scanning**: Switch between "Vehicle Mode" for full car identification and "Part Mode" for component-level scanning.
- **Demo Mode**: A built-in fail-safe mode that allows users to explore the application's features using mocked data even when database connectivity is limited.
- **Secure Authentication**: User accounts and data persistence powered by Supabase.

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for a modern, responsive mobile-first UI
- **AI Engine**: Google Gemini (Generative AI) for multimodal image analysis and structured data extraction
- **Backend/Database**: Supabase (PostgreSQL) for user data and parts catalog
- **Storage**: Supabase Storage for vehicle and part image hosting
- **Animations**: Framer Motion for smooth UI transitions

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
Create a `.env` file in the root directory and add the following:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
API_KEY=your_gemini_api_key
```

### Database Setup
Execute the provided `database.sql` script in your Supabase SQL Editor to set up the necessary tables, RLS policies, and the `get_parts_for_vehicle` RPC function.

### Running Locally
```bash
npm install
npm run dev
```

## 📱 Mobile App (APK) Generation

To package **spareparts.ai** as a mobile application for Android using Flutter, follow these steps:

### 1. Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) installed on your machine.
- Android Studio with Android SDK and Command Line Tools.

### 2. Create Flutter Wrapper
Create a new Flutter project to act as a WebView wrapper for the web application:

```bash
flutter create spareparts_mobile
cd spareparts_mobile
```

### 3. Add WebView Dependency
Add the `webview_flutter` package to your `pubspec.yaml`:

```bash
flutter pub add webview_flutter
```

### 4. Configure WebView
In your `lib/main.dart`, set up the WebView to point to your hosted application URL:

```dart
// Example snippet for main.dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(MaterialApp(home: WebViewApp()));

class WebViewApp extends StatefulWidget {
  @override
  State<WebViewApp> createState() => _WebViewAppState();
}

class _WebViewAppState extends State<WebViewApp> {
  late final WebViewController controller;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse('https://your-app-url.run.app'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: WebViewWidget(controller: controller)),
    );
  }
}
```

### 5. Generate APK
Run the following command to generate a production-ready release APK:

```bash
flutter build apk --release
```
The generated APK will be located at:
`build/app/outputs/flutter-apk/app-release.apk`

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
