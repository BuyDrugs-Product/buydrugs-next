'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';

interface GooglePlacesAutocompleteProps {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (address: string, placeDetails?: PlaceDetails) => void;
    helperText?: string;
    required?: boolean;
    className?: string;
    apiKey: string;
}

declare global {
    interface Window {
        google: typeof google;
    }
}

export interface PlaceDetails {
    address: string;
    latitude: number;
    longitude: number;
    placeId: string;
    formattedAddress: string;
}

export const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
    label,
    placeholder = 'Start typing an address...',
    value,
    onChange,
    helperText,
    required = false,
    className,
    apiKey,
}) => {
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const [isLoadingScript, setIsLoadingScript] = useState(true);
    const [scriptError, setScriptError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    // Removed placesService ref as we are migrating to google.maps.places.Place
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Load Google Maps script
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if already loaded
        if (window.google?.maps?.places) {
            initializeServices();
            setIsLoadingScript(false);
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => {
                initializeServices();
                setIsLoadingScript(false);
            });
            return;
        }

        // Load the script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            initializeServices();
            setIsLoadingScript(false);
        };

        script.onerror = () => {
            setScriptError('Failed to load Google Maps. Please check your API key.');
            setIsLoadingScript(false);
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup is tricky with Google Maps, so we'll leave the script loaded
        };
    }, [apiKey]);

    const initializeServices = () => {
        if (window.google?.maps?.places) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            // PlacesService is no longer needed with the new Place class
        }
    };

    // Handle clicks outside to close predictions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowPredictions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        if (!newValue.trim() || !autocompleteService.current) {
            setPredictions([]);
            setShowPredictions(false);
            return;
        }

        // Get predictions from Google Places API
        autocompleteService.current.getPlacePredictions(
            {
                input: newValue,
                // types: ['address', 'establishment'], // Removed to allow both addresses and establishments
            },
            (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    setPredictions(results);
                    setShowPredictions(true);
                } else {
                    setPredictions([]);
                    setShowPredictions(false);
                }
            }
        );
    };

    const handlePredictionClick = async (prediction: google.maps.places.AutocompletePrediction) => {
        if (!window.google?.maps?.places?.Place) {
            console.error('Google Maps Places library not loaded or Place class not available');
            return;
        }

        try {
            // Use the new Place class
            // @ts-ignore - Place class might not be in the types yet
            const place = new window.google.maps.places.Place({
                id: prediction.place_id,
            });

            // Fetch details
            // @ts-ignore - fetchFields might not be in the types yet
            await place.fetchFields({
                fields: ['location', 'formattedAddress', 'displayName'],
            });

            // @ts-ignore
            const location = place.location;
            // @ts-ignore
            const formattedAddress = place.formattedAddress;

            if (location) {
                const latitude = location.lat();
                const longitude = location.lng();

                const placeDetails: PlaceDetails = {
                    address: prediction.description,
                    latitude,
                    longitude,
                    placeId: prediction.place_id,
                    formattedAddress: formattedAddress || prediction.description,
                };

                onChange(prediction.description, placeDetails);
                setShowPredictions(false);
                setPredictions([]);
            }
        } catch (error) {
            console.error('Error fetching place details:', error);
        }
    };

    if (scriptError) {
        return (
            <div className={cn('space-y-2', className)}>
                <label className="text-sm font-medium text-(--text-primary)">
                    {label}
                    {required && <span className="ml-1 text-(--text-error)">*</span>}
                </label>
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {scriptError}
                </div>
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className={cn('relative space-y-2', className)}>
            <label className="text-sm font-medium text-(--text-primary)">
                {label}
                {required && <span className="ml-1 text-(--text-error)">*</span>}
            </label>

            <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-tertiary)">
                    <MapPin className="h-4 w-4" />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (predictions.length > 0) {
                            setShowPredictions(true);
                        }
                    }}
                    placeholder={isLoadingScript ? 'Loading Google Maps...' : placeholder}
                    disabled={isLoadingScript}
                    required={required}
                    className={cn(
                        'h-11 w-full rounded-[var(--radius-sm)] border border-(--border-default) bg-(--surface-elevated) pl-10 pr-3 text-sm text-(--text-primary) shadow-(--shadow-1) transition-all',
                        'placeholder:text-(--text-tertiary)',
                        'hover:border-(--border-strong)',
                        'focus:border-(--border-focus) focus:outline-none focus:ring-4 focus:ring-[rgba(89,71,255,0.18)]',
                        'disabled:cursor-not-allowed disabled:opacity-60'
                    )}
                />

                {/* Predictions Dropdown */}
                {showPredictions && predictions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-(--border-default) bg-white shadow-(--shadow-card)">
                        {predictions.map((prediction) => (
                            <button
                                key={prediction.place_id}
                                type="button"
                                onClick={() => handlePredictionClick(prediction)}
                                className={cn(
                                    'flex w-full items-start gap-3 border-b border-(--border-subtle) px-4 py-3 text-left transition-colors last:border-b-0',
                                    'hover:bg-(--surface-muted) focus:bg-(--surface-muted) focus:outline-none'
                                )}
                            >
                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-(--text-tertiary)" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-(--text-primary) truncate">
                                        {prediction.structured_formatting.main_text}
                                    </p>
                                    <p className="text-xs text-(--text-secondary) truncate">
                                        {prediction.structured_formatting.secondary_text}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {helperText && (
                <p className="text-xs text-(--text-secondary)">{helperText}</p>
            )}
        </div>
    );
};
