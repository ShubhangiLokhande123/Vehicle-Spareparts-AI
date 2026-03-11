import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Session } from '@supabase/supabase-js';
import { Screen, Vehicle, VehicleIdentification, Part } from './types';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import SelectImageScreen from './components/SelectImageScreen';
import ImagePreviewScreen from './components/ImagePreviewScreen';
import ProcessingScreen from './components/ProcessingScreen';
import VehicleConfirmationScreen from './components/ResultsListScreen';
import VehicleDetailScreen from './components/VehicleDetailScreen';
import PartResultsScreen from './components/PartResultsScreen';
import PartDetailScreen from './components/PartDetailScreen';
import SavedPartsScreen from './components/SavedPartsScreen';
import HistoryScreen from './components/HistoryScreen';
import SettingsScreen from './components/SettingsScreen';
import { identifyVehicleFromImage, identifyPartFromImage } from './services/geminiService';
import { supabase } from './lib/supabase';
import './global.css';

WebBrowser.maybeCompleteAuthSession();

// Mock session for testing (Available if needed, but disabled for production auth flow)
const MOCK_SESSION = {
  access_token: 'mock',
  refresh_token: 'mock',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: { full_name: 'Test User' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  }
} as unknown as Session;

const FALLBACK_CATALOG_PARTS: Part[] = [
  { name: 'Oil Filter', imageUrl: 'https://placehold.co/600x400.webp?text=Oil+Filter', sku: 'OF-123', confidenceScore: 100, description: 'Standard oil filter for this vehicle.', category: 'Engine' },
  { name: 'Air Filter', imageUrl: 'https://placehold.co/600x400.webp?text=Air+Filter', sku: 'AF-456', confidenceScore: 100, description: 'High flow air filter.', category: 'Engine' },
  { name: 'Spark Plug', imageUrl: 'https://placehold.co/600x400.webp?text=Spark+Plug', sku: 'SP-789', confidenceScore: 100, description: 'Long-lasting iridium spark plug.', category: 'Ignition' },
  { name: 'Brake Pads', imageUrl: 'https://placehold.co/600x400.webp?text=Brake+Pads', sku: 'BP-001', confidenceScore: 100, description: 'Ceramic front brake pads.', category: 'Brakes' },
];

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Home);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // App flow state
  const [scanMode, setScanMode] = useState<'vehicle' | 'part'>('vehicle');
  const [processingTitle, setProcessingTitle] = useState('Processing...');
  
  // Vehicle flow state
  const [vehicleResults, setVehicleResults] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleIdentification | null>(null);

  // Part flow state
  const [partResults, setPartResults] = useState<Part[]>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [lastScreen, setLastScreen] = useState<Screen | null>(null);

  if (!supabase) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-8">
          <Text className="text-2xl font-bold text-red-600 mb-4">⚠️ Configuration Error</Text>
          <Text className="text-gray-700 font-semibold text-center mb-4">Supabase credentials are missing or invalid.</Text>
          <View className="bg-red-50 p-4 rounded-lg border border-red-200 w-full">
            <Text className="text-gray-600 text-sm mb-2">
              This app requires Supabase to function. Please set the following environment variables:
            </Text>
            <View className="bg-red-100 p-2 rounded">
              <Text className="text-sm text-gray-500 font-mono">• SUPABASE_URL</Text>
              <Text className="text-sm text-gray-500 font-mono">• SUPABASE_ANON_KEY</Text>
            </View>
             <Text className="text-xs text-gray-400 mt-3">You can find these values in your Supabase project's API settings.</Text>
          </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (_event === 'SIGNED_OUT') {
        setCurrentScreen(Screen.Home);
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
        // Create the redirect URL for the OAuth callback
        const redirectUrl = makeRedirectUri({
            scheme: 'sparepartsai',
            path: 'auth/callback',
        });
        
        console.log('Redirect URL:', redirectUrl);
        
        // Use Supabase's signInWithOAuth with Google
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: false, // Changed to false for proper OAuth flow
            }
        });

        if (error) {
            console.error('OAuth initialization error:', error);
            throw error;
        }

        if (data?.url) {
            console.log('Opening OAuth URL:', data.url);
            
            // Open the Google sign-in page in a browser
            const result = await WebBrowser.openAuthSessionAsync(
                data.url, 
                redirectUrl,
                {
                    showInRecents: true,
                }
            );
            
            console.log('Browser result:', result);
            
            if (result.type === 'success' && result.url) {
                // Parse the URL to extract the auth code or tokens
                const url = new URL(result.url);
                const params = new URLSearchParams(url.hash.substring(1)); // For hash-based tokens
                const queryParams = new URLSearchParams(url.search); // For query-based tokens
                
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                const code = queryParams.get('code');

                console.log('Auth response - code:', code, 'accessToken:', accessToken ? 'present' : 'missing');

                // If we have a code, exchange it for a session
                if (code) {
                    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
                    if (sessionError) {
                        console.error('Session exchange error:', sessionError);
                        throw sessionError;
                    }
                    console.log('Session established via code exchange');
                } else if (accessToken && refreshToken) {
                    // Otherwise, set the session directly with tokens
                    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                    if (sessionError) {
                        console.error('Session set error:', sessionError);
                        throw sessionError;
                    }
                    console.log('Session established via tokens');
                } else {
                    throw new Error('No authentication code or tokens received from Google');
                }
            } else if (result.type === 'cancel') {
                setAuthError('Sign-in was cancelled');
            } else {
                throw new Error('Authentication failed or was dismissed');
            }
        } else {
            throw new Error('No OAuth URL received from Supabase');
        }
    } catch (e: any) {
        console.error('Google login error:', e);
        setAuthError(e.message || 'Failed to sign in with Google. Please check your internet connection and try again.');
    } finally {
        setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    if (!email) {
        Alert.alert("Error", "Please enter your email address to reset your password.");
        return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setSuccessMessage(null);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: makeRedirectUri({ scheme: 'sparepartsai' }),
    });
    
    setAuthLoading(false);
    if (error) {
        setAuthError(error.message);
    } else {
        setSuccessMessage("Password reset link sent! Check your email.");
    }
  };

  const handleEmailSignUp = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    setSuccessMessage(null);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
    });
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
    } else if (data.session) {
      // User is logged in automatically, onAuthStateChange will handle redirection
    } else {
      setSuccessMessage("Success! Please check your email for a confirmation link.");
    }
  };

  const handleEmailLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    setSuccessMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // --- Main App Navigation ---

  const handleStartIdentification = () => {
    setScanMode('vehicle');
    setImageUri(null);
    setVehicleResults([]);
    setError(null);
    setCurrentScreen(Screen.SelectImage);
  };

  const handleViewParts = (vehicle: VehicleIdentification) => {
    setSelectedVehicle(vehicle);
    setCurrentScreen(Screen.VehicleDetail);
  };

  const handleStartPartScan = () => {
    setScanMode('part');
    setImageUri(null);
    setPartResults([]);
    setError(null);
    setCurrentScreen(Screen.SelectImage);
  };

  const handleBrowseCatalog = async () => {
    if (!selectedVehicle) return;
    
    setProcessingTitle('Fetching Catalog...');
    setCurrentScreen(Screen.Processing);

    try {
      let { data, error } = await supabase.rpc('get_parts_for_vehicle', {
        v_make: selectedVehicle.make,
        v_model: selectedVehicle.model,
        v_year_start: selectedVehicle.yearStart,
        v_year_end: selectedVehicle.yearEnd
      });

      // Fallback 1: Broad search on full model name
      if (!error && (!data || data.length === 0)) {
          console.log("Strict search returned 0, trying broad search on model...");
          const { data: broadData, error: broadError } = await supabase
            .from('vehicle_compatibility')
            .select('parts_catalog(*)')
            .ilike('vehicle_model', `%${selectedVehicle.model}%`)
            .limit(20);
            
          if (!broadError && broadData && broadData.length > 0) {
              data = broadData.map((item: any) => ({ ...item.parts_catalog, image_url: item.parts_catalog.image_url }));
          }
      }

      // Fallback 2: Search by first word of model (e.g. "Pulsar" from "Pulsar 220F")
      if (!error && (!data || data.length === 0)) {
          const firstWord = selectedVehicle.model.split(' ')[0];
          if (firstWord && firstWord.length > 2) {
              console.log(`Broad search returned 0, trying first word: ${firstWord}...`);
              const { data: wordData, error: wordError } = await supabase
                .from('vehicle_compatibility')
                .select('parts_catalog(*)')
                .ilike('vehicle_model', `%${firstWord}%`)
                .limit(20);

              if (!wordError && wordData && wordData.length > 0) {
                  data = wordData.map((item: any) => ({ ...item.parts_catalog, image_url: item.parts_catalog.image_url }));
              }
          }
      }

      // Fallback 3: Search by Make only (Last resort)
      if (!error && (!data || data.length === 0)) {
          console.log("Model search returned 0, trying make search...");
          const { data: makeData, error: makeError } = await supabase
            .from('vehicle_compatibility')
            .select('parts_catalog(*)')
            .ilike('vehicle_make', `%${selectedVehicle.make}%`)
            .limit(20);

          if (!makeError && makeData && makeData.length > 0) {
              data = makeData.map((item: any) => ({ ...item.parts_catalog, image_url: item.parts_catalog.image_url }));
          }
      }

      if (error) {
        console.warn("Supabase error:", error);
        // Fallback if table is missing or other error
        setPartResults(FALLBACK_CATALOG_PARTS);
        setCurrentScreen(Screen.PartResults);
        return;
      }

      const parts = data?.map((item: any) => {
          let imageUrl = item.image_url;
          
          // Provide fallback if image_url is missing
          if (!imageUrl) {
              imageUrl = `https://placehold.co/600x400.png?text=${encodeURIComponent(item.name)}`;
          }

          // Fix for placehold.co images needing .webp extension for React Native
          if (imageUrl && imageUrl.includes('placehold.co') && !imageUrl.includes('.webp') && !imageUrl.includes('.png')) {
             const textMatch = imageUrl.match(/text=([^&]*)/);
             const textParam = textMatch ? `?text=${textMatch[1]}` : '';
             imageUrl = `https://placehold.co/600x400.webp${textParam}`;
          }

          return {
              id: item.id,
              name: item.name,
              sku: item.sku,
              description: item.description,
              category: item.category,
              imageUrl: imageUrl,
              confidenceScore: 100
          };
      }) || [];

      if (parts.length === 0) {
         console.log("No parts found in DB for", selectedVehicle);
         Alert.alert("Catalog Empty", "No compatible parts found in database for this vehicle. Showing demo parts.");
         // Fallback if no parts found in DB, just so user sees something in this demo
         setPartResults(FALLBACK_CATALOG_PARTS);
      } else {
         // Remove duplicates
         const uniqueParts = parts.filter((part: Part, index: number, self: Part[]) =>
            index === self.findIndex((t) => (
                t.sku === part.sku
            ))
         );
         setPartResults(uniqueParts);
      }
      
      setCurrentScreen(Screen.PartResults);
    } catch (err) {
      console.error(err);
      // Fallback on crash
      setPartResults(FALLBACK_CATALOG_PARTS);
      setCurrentScreen(Screen.PartResults);
    }
  };
  
  const handleGoToSettings = () => {
    setCurrentScreen(Screen.Settings);
  };

  const handleGoToSavedParts = () => {
    setCurrentScreen(Screen.SavedParts);
  };

  const handleGoToHistory = () => {
    setCurrentScreen(Screen.History);
  };

  const handleImageSelected = (uri: string) => {
    setImageUri(uri);
    setCurrentScreen(Screen.Preview);
  };

  const handleIdentify = useCallback(async () => {
    if (!imageUri) return;
    
    setProcessingTitle(scanMode === 'vehicle' ? 'Analyzing Vehicle...' : 'Analyzing Part...');
    setCurrentScreen(Screen.Processing);
    setError(null);

    try {
      const processPromise = new Promise(resolve => setTimeout(resolve, 2000));
      let identifyPromise;

      if (scanMode === 'vehicle') {
        identifyPromise = identifyVehicleFromImage(imageUri);
        const [_, results] = await Promise.all([processPromise, identifyPromise]);
        setVehicleResults(results as Vehicle[]);
        setCurrentScreen(Screen.VehicleConfirm);
      } else { // scanMode === 'part'
        if (!selectedVehicle) throw new Error("No vehicle selected for part scan.");
        identifyPromise = identifyPartFromImage(imageUri, selectedVehicle);
        const [_, results] = await Promise.all([processPromise, identifyPromise]);
        setPartResults(results as Part[]);
        setCurrentScreen(Screen.PartResults);
      }
    } catch (err: any) {
      const message = err.message || 'An unknown error occurred.';
      setError(scanMode === 'vehicle' 
        ? `Failed to identify the vehicle. ${message}`
        : `Failed to identify the part. ${message}`
      );
      setCurrentScreen(Screen.Preview);
    }
  }, [imageUri, scanMode, selectedVehicle]);

  const saveIdentification = async (vehicle: Vehicle, confirmed: boolean): Promise<VehicleIdentification | null> => {
    if (!session?.user || !imageUri) {
        setError("User session or image file is missing.");
        return null;
    }

    // Mock session check - bypass backend calls
    if (session.user.id === 'test-user-id') {
      return {
        identification_id: Date.now(),
        created_at: new Date().toISOString(),
        user_confirmed: confirmed,
        make: vehicle.make,
        model: vehicle.model,
        yearStart: vehicle.yearStart,
        yearEnd: vehicle.yearEnd,
        variant: vehicle.variant,
        confidenceScore: vehicle.confidenceScore || 0,
        localImageUri: imageUri || undefined,
      };
    }

    // 1. Upload image to Supabase storage
    const fileExt = imageUri.split('.').pop();
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
    
    try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('vehicle_images')
            .upload(fileName, arrayBuffer, {
                contentType: blob.type || 'image/jpeg',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            setError(`Failed to upload vehicle image: ${uploadError.message}`);
            setCurrentScreen(Screen.Preview); // Go back to preview to show the error
            return null;
        }

        // 2. Insert identification record into the database
        const { data, error } = await supabase
        .from('vehicle_identifications')
        .insert({
            user_id: session.user.id,
            image_storage_path: uploadData.path,
            ai_raw_response: vehicleResults,
            identified_make: vehicle.make,
            identified_model: vehicle.model,
            identified_year_start: vehicle.yearStart,
            identified_year_end: vehicle.yearEnd,
            identified_variant: vehicle.variant,
            ai_confidence_score: vehicle.confidenceScore,
            user_confirmed: confirmed,
            confirmed_at: confirmed ? new Date().toISOString() : null
        })
        .select(`
            id, created_at, user_confirmed, identified_make, identified_model,
            identified_year_start, identified_year_end, identified_variant, ai_confidence_score, image_storage_path
        `)
        .single();

        if (error) {
            console.error('Failed to save identification:', error);
            setError('Failed to save your selection. Please try again.');
            return null;
        }
        
        if (data) {
            return {
                identification_id: data.id,
                created_at: data.created_at,
                user_confirmed: data.user_confirmed,
                make: data.identified_make,
                model: data.identified_model,
                yearStart: data.identified_year_start,
                yearEnd: data.identified_year_end,
                variant: data.identified_variant,
                confidenceScore: data.ai_confidence_score || 0,
                image_storage_path: data.image_storage_path,
                localImageUri: imageUri || undefined,
            };
        }
    } catch (e) {
        console.error("Error saving identification", e);
        setError("An error occurred while saving.");
    }
    return null;
  };

  const handleConfirmVehicle = async (vehicle: Vehicle) => {
    const newIdentification = await saveIdentification(vehicle, true);
    if (newIdentification) {
        setSelectedVehicle(newIdentification);
        setCurrentScreen(Screen.VehicleDetail);
    }
  };

  const handleRejectVehicle = async () => {
    if (vehicleResults.length > 0 && imageUri) {
      await saveIdentification(vehicleResults[0], false);
    }
    // Reset state for a new attempt
    setImageUri(null);
    setVehicleResults([]);
    setError(null);
    setCurrentScreen(Screen.SelectImage);
  };

  const handleViewPartDetail = (part: Part) => {
    setSelectedPart(part);
    setLastScreen(currentScreen);
    setCurrentScreen(Screen.PartDetail);
  };

  const handleBack = () => {
    setError(null);
    switch (currentScreen) {
      case Screen.SelectImage:
        if (scanMode === 'part') setCurrentScreen(Screen.VehicleDetail);
        else setCurrentScreen(Screen.Home);
        break;
      case Screen.Preview:
        setCurrentScreen(Screen.SelectImage);
        break;
      case Screen.VehicleConfirm:
        setCurrentScreen(Screen.Preview);
        break;
      case Screen.VehicleDetail:
        setCurrentScreen(Screen.Home);
        break;
      case Screen.PartResults:
        setCurrentScreen(Screen.VehicleDetail);
        break;
      case Screen.PartDetail:
        if (lastScreen === Screen.SavedParts) {
            setCurrentScreen(Screen.SavedParts);
        } else if (scanMode === 'part') {
            setCurrentScreen(Screen.PartResults);
        } else {
            setCurrentScreen(Screen.VehicleDetail);
        }
        break;
      case Screen.Settings:
        setCurrentScreen(Screen.Home);
        break;
      case Screen.SavedParts:
        setCurrentScreen(Screen.Home);
        break;
      case Screen.History:
        setCurrentScreen(Screen.Home);
        break;
      default:
        setCurrentScreen(Screen.Home);
        break;
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Home:
        return <HomeScreen onStart={handleStartIdentification} session={session!} onViewParts={handleViewParts} onGoToSettings={handleGoToSettings} onGoToSavedParts={handleGoToSavedParts} onGoToHistory={handleGoToHistory} onSignOut={handleSignOut} />;
      case Screen.SelectImage:
        return <SelectImageScreen onImageSelected={handleImageSelected} onClose={handleBack} title={scanMode === 'vehicle' ? 'Upload Vehicle Photo' : 'Upload Part Photo'} />;
      case Screen.Preview:
        return imageUri && <ImagePreviewScreen fileUri={imageUri} onIdentify={handleIdentify} onBack={handleBack} error={error} buttonText={scanMode === 'vehicle' ? 'Identify Vehicle' : 'Identify Part'} />;
      case Screen.Processing:
        return <ProcessingScreen title={processingTitle} />;
      case Screen.VehicleConfirm:
        return <VehicleConfirmationScreen results={vehicleResults} onConfirm={handleConfirmVehicle} onReject={handleRejectVehicle} onBack={handleBack} />;
      case Screen.VehicleDetail:
        return selectedVehicle && <VehicleDetailScreen vehicle={selectedVehicle} onScanPart={handleStartPartScan} onBrowseCatalog={handleBrowseCatalog} onBack={handleBack} onViewPartDetail={handleViewPartDetail} />;
      case Screen.PartResults:
        return <PartResultsScreen results={partResults} onViewDetails={handleViewPartDetail} onBack={handleBack} />;
      case Screen.PartDetail:
        return selectedPart && <PartDetailScreen part={selectedPart} onBack={handleBack} />;
      case Screen.Settings:
        return <SettingsScreen session={session!} onBack={handleBack} onSignOut={handleSignOut} />;
      case Screen.SavedParts:
        return <SavedPartsScreen session={session!} onViewDetails={handleViewPartDetail} onBack={handleBack} />;
      case Screen.History:
        return <HistoryScreen session={session!} onViewVehicle={handleViewParts} onBack={handleBack} />;
      default:
        return <HomeScreen onStart={handleStartIdentification} session={session!} onViewParts={handleViewParts} onGoToSettings={handleGoToSettings} onGoToSavedParts={handleGoToSavedParts} onGoToHistory={handleGoToHistory} onSignOut={handleSignOut} />;
    }
  };
  
  const renderAppContent = () => {
    if (loading) {
        return (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        );
    }
    if (!session) {
        return <LoginScreen onGoogleLogin={handleGoogleLogin} onEmailLogin={handleEmailLogin} onEmailSignUp={handleEmailSignUp} onForgotPassword={handleForgotPassword} authError={authError} successMessage={successMessage} loading={authLoading}/>;
    }
    return renderScreen();
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-gray-50">
        {renderAppContent()}
      </View>
    </SafeAreaView>
  );
}
