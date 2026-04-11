import { GoogleGenAI } from '@google/genai';
import * as FileSystem from 'expo-file-system';
import { Vehicle, Part, VehicleIdentification } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Initialize the Gemini AI client
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Converts a local file URI to a base64 encoded string.
 */
const fileUriToBase64 = async (uri: string): Promise<string> => {
    try {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        return base64;
    } catch (error) {
        console.error("Error converting file to base64:", error);
        throw new Error("Failed to process image file.");
    }
};

/**
 * Identifies a vehicle from an image using Gemini AI.
 */
export const identifyVehicleFromImage = async (imageUri: string): Promise<Vehicle[]> => {
    if (!ai) {
         console.warn("Gemini API key is missing. Returning mock data.");
         // Mock data for development when API key is not set
         return [
             {
                 id: 'mock-veh-1',
                 make: 'Honda',
                 model: 'Civic',
                 yearStart: 2016,
                 yearEnd: 2021,
                 variant: 'EX',
                 confidenceScore: 95
             }
         ];
    }

    try {
        const base64Data = await fileUriToBase64(imageUri);
        // Determine mime type based on extension (basic approach)
        const mimeType = imageUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

        const prompt = `
            Analyze this image of a vehicle.
            Identify the Make, Model, the exact Year or Generation (expressed as a start and end year, e.g., 2010-2014), and the specific Variant/Trim if possible.
            Calculate a confidence score between 0 and 100 for your identification.

            Return the result EXACTLY as a JSON array of objects with the following keys:
            - make (string)
            - model (string)
            - yearStart (number)
            - yearEnd (number)
            - variant (string)
            - confidenceScore (number)

            Example format:
            [
              {
                "make": "Toyota",
                "model": "Camry",
                "yearStart": 2018,
                "yearEnd": 2024,
                "variant": "XSE",
                "confidenceScore": 92
              }
            ]

            Do not include any markdown formatting (like \`\`\`json) or conversational text in your response. Just the raw JSON array.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ]
        });

        const textResponse = response.text;
        if (!textResponse) {
             throw new Error("Empty response from AI");
        }

        // Attempt to clean the response if it has markdown formatting
        const cleanedText = textResponse.replace(/```json\n?|\n?```/g, '').trim();

        const parsedData = JSON.parse(cleanedText);

        // Basic validation and mapping
        if (Array.isArray(parsedData) && parsedData.length > 0) {
            return parsedData.map((item: any, index: number) => ({
                id: `veh-${Date.now()}-${index}`,
                make: item.make || 'Unknown Make',
                model: item.model || 'Unknown Model',
                yearStart: parseInt(item.yearStart) || 0,
                yearEnd: parseInt(item.yearEnd) || 0,
                variant: item.variant || 'Unknown Variant',
                confidenceScore: parseInt(item.confidenceScore) || 0
            }));
        } else {
            throw new Error("AI returned invalid data format.");
        }

    } catch (error) {
        console.error("Vehicle Identification Error:", error);
        throw error;
    }
};

/**
 * Identifies a specific car part from an image, given the context of a specific vehicle.
 */
export const identifyPartFromImage = async (imageUri: string, vehicleContext: VehicleIdentification): Promise<Part[]> => {
    if (!ai) {
        console.warn("Gemini API key is missing. Returning mock data.");
        // Mock data
        return [
            {
                name: 'Brake Pad Set',
                sku: 'BP-MOCK-001',
                description: `Ceramic brake pad set compatible with ${vehicleContext.make} ${vehicleContext.model}.`,
                category: 'Brakes',
                confidenceScore: 88,
                imageUrl: 'https://placehold.co/600x400.webp?text=Brake+Pad'
            }
        ];
    }

    try {
        const base64Data = await fileUriToBase64(imageUri);
        const mimeType = imageUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

        const prompt = `
            Analyze this image of a vehicle spare part.
            The user claims this part is for a ${vehicleContext.yearStart}-${vehicleContext.yearEnd} ${vehicleContext.make} ${vehicleContext.model} ${vehicleContext.variant}.

            Identify the part. Provide a generic name, a likely category (e.g., Engine, Brakes, Suspension, Electrical, Body), and a brief technical description.
            Generate a plausible standardized SKU format for this type of part (it doesn't have to be a real OEM number, but format it like one).
            Calculate a confidence score (0-100) for your identification.

            Return the result EXACTLY as a JSON array of objects with the following keys:
            - name (string)
            - sku (string)
            - description (string)
            - category (string)
            - confidenceScore (number)

            Example format:
            [
              {
                "name": "Oil Filter",
                "sku": "OF-TY-8821",
                "description": "Standard spin-on oil filter.",
                "category": "Engine",
                "confidenceScore": 95
              }
            ]

            Do not include any markdown formatting or conversational text. Just the raw JSON array.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ]
        });

        const textResponse = response.text;
        if (!textResponse) {
             throw new Error("Empty response from AI");
        }

        const cleanedText = textResponse.replace(/```json\n?|\n?```/g, '').trim();
        const parsedData = JSON.parse(cleanedText);

        if (Array.isArray(parsedData) && parsedData.length > 0) {
            return parsedData.map((item: any, index: number) => ({
                id: Date.now() + index, // Mock ID
                name: item.name || 'Unknown Part',
                sku: item.sku || 'UNK-000',
                description: item.description || 'No description available.',
                category: item.category || 'Uncategorized',
                confidenceScore: parseInt(item.confidenceScore) || 0,
                imageUrl: `https://placehold.co/600x400.webp?text=${encodeURIComponent(item.name || 'Part')}` // Fallback image
            }));
        } else {
            throw new Error("AI returned invalid data format.");
        }

    } catch (error) {
        console.error("Part Identification Error:", error);
        throw error;
    }
};
