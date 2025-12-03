'use client';

/// <reference types="@types/google.maps" />

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
    onError?: (error: Error) => void;
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
    onError,
}) => {
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const [isLoadingScript, setIsLoadingScript] = useState(true);
    const [scriptError, setScriptError] = useState<string | null>(null);
    const [placeError, setPlaceError] = useState<string | null>(null);
    const [focusedPredictionIndex, setFocusedPredictionIndex] = useState<number>(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    // Removed placesService ref as we are migrating to google.maps.places.Place
    const wrapperRef = useRef<HTMLDivElement>(null);
    const scriptLoadHandlerRef = useRef<(() => void) | null>(null);
    const existingScriptRef = useRef<HTMLScriptElement | null>(null);
    const isMountedRef = useRef(true);
    const requestIdRef = useRef(0);
    const predictionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Load Google Maps script
    useEffect(() => {
        if (typeof window === 'undefined') return;

        isMountedRef.current = true;

        // Check if already loaded
        if (window.google?.maps?.places) {
            initializeServices();
            setIsLoadingScript(false);
            return;
        }

        // Create named handler function
        const handleScriptLoad = () => {
            if (!isMountedRef.current) return;
            initializeServices();
            setIsLoadingScript(false);
        };

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]') as HTMLScriptElement | null;
        if (existingScript) {
            // Guard against duplicate listeners by checking if handler is already stored
            if (!scriptLoadHandlerRef.current) {
                scriptLoadHandlerRef.current = handleScriptLoad;
                existingScriptRef.current = existingScript;
                existingScript.addEventListener('load', handleScriptLoad);
            }
            return;
        }

        // Load the script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            if (!isMountedRef.current) return;
            initializeServices();
            setIsLoadingScript(false);
        };

        script.onerror = () => {
            if (!isMountedRef.current) return;
            setScriptError('Failed to load Google Maps. Please check your API key.');
            setIsLoadingScript(false);
        };

        document.head.appendChild(script);

        return () => {
            isMountedRef.current = false;
            // Remove event listener if it was attached to an existing script
            if (scriptLoadHandlerRef.current && existingScriptRef.current) {
                existingScriptRef.current.removeEventListener('load', scriptLoadHandlerRef.current);
                scriptLoadHandlerRef.current = null;
                existingScriptRef.current = null;
            }
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
                setFocusedPredictionIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        
        // Clear any previous place errors on new input
        setPlaceError(null);

        // Increment request ID to invalidate any pending callbacks
        requestIdRef.current += 1;
        const currentRequestId = requestIdRef.current;

        if (!newValue.trim() || !autocompleteService.current) {
            setPredictions([]);
            setShowPredictions(false);
            setFocusedPredictionIndex(-1);
            return;
        }

        // Capture the current service and requestId before making the async call
        const service = autocompleteService.current;
        if (!service) {
            setPredictions([]);
            setShowPredictions(false);
            return;
        }

        // Get predictions from Google Places API
        service.getPlacePredictions(
            {
                input: newValue,
                // types: ['address', 'establishment'], // Removed to allow both addresses and establishments
            },
            (results, status) => {
                // Verify the service is still present and this request hasn't been superseded
                if (!isMountedRef.current || !autocompleteService.current || requestIdRef.current !== currentRequestId) {
                    // Request was superseded or component unmounted, ignore results
                    return;
                }

                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    setPredictions(results);
                    setShowPredictions(true);
                } else {
                    setPredictions([]);
                    setShowPredictions(false);
                    setFocusedPredictionIndex(-1);
                }
            }
        );
    };

    const handlePredictionClick = async (prediction: google.maps.places.AutocompletePrediction) => {
        // Clear any previous errors before attempting new selection
        setPlaceError(null);
        
        if (!window.google?.maps?.places?.Place) {
            const error = new Error('Google Maps Places library not loaded or Place class not available');
            console.error(error.message);
            const errorMessage = 'Unable to load place details. Please try again.';
            setPlaceError(errorMessage);
            onError?.(error);
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
                setFocusedPredictionIndex(-1);
                // Clear any errors on successful selection
                setPlaceError(null);
            }
        } catch (error) {
            console.error('Error fetching place details:', error);
            const errorMessage = 'Failed to load place details. Please try selecting again.';
            setPlaceError(errorMessage);
            
            // Clear loading indicators and predictions on error
            setShowPredictions(false);
            setPredictions([]);
            setFocusedPredictionIndex(-1);
            
            // Call optional error callback
            if (error instanceof Error) {
                onError?.(error);
            } else {
                onError?.(new Error(String(error)));
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Only handle keyboard navigation when predictions are visible
        if (!showPredictions || predictions.length === 0) {
            return;
        }

        switch (e.key) {
            case 'ArrowDown': {
                e.preventDefault();
                setFocusedPredictionIndex((prev) => {
                    const nextIndex = prev < predictions.length - 1 ? prev + 1 : 0;
                    // Scroll the focused prediction into view
                    setTimeout(() => {
                        const focusedElement = predictionRefs.current[nextIndex];
                        if (focusedElement) {
                            focusedElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                            });
                        }
                    }, 0);
                    return nextIndex;
                });
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                setFocusedPredictionIndex((prev) => {
                    const nextIndex = prev > 0 ? prev - 1 : predictions.length - 1;
                    // Scroll the focused prediction into view
                    setTimeout(() => {
                        const focusedElement = predictionRefs.current[nextIndex];
                        if (focusedElement) {
                            focusedElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                            });
                        }
                    }, 0);
                    return nextIndex;
                });
                break;
            }
            case 'Enter': {
                e.preventDefault();
                const indexToSelect = focusedPredictionIndex >= 0 ? focusedPredictionIndex : 0;
                const predictionToSelect = predictions[indexToSelect];
                if (predictionToSelect) {
                    handlePredictionClick(predictionToSelect);
                }
                break;
            }
            case 'Escape': {
                e.preventDefault();
                setShowPredictions(false);
                setFocusedPredictionIndex(-1);
                break;
            }
        }
    };

    // Reset focused index when predictions change
    useEffect(() => {
        setFocusedPredictionIndex(-1);
        // Reset refs array when predictions change
        predictionRefs.current = new Array(predictions.length);
    }, [predictions]);

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
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        // Clear errors when user focuses input for new attempt
                        setPlaceError(null);
                        if (predictions.length > 0) {
                            setShowPredictions(true);
                        }
                    }}
                    placeholder={isLoadingScript ? 'Loading Google Maps...' : placeholder}
                    disabled={isLoadingScript}
                    required={required}
                    aria-activedescendant={
                        showPredictions && focusedPredictionIndex >= 0
                            ? `prediction-${focusedPredictionIndex}`
                            : undefined
                    }
                    aria-expanded={showPredictions}
                    aria-haspopup="listbox"
                    role="combobox"
                    className={cn(
                        'h-11 w-full rounded-sm border border-(--border-default) bg-(--surface-elevated) pl-10 pr-3 text-sm text-(--text-primary) shadow-(--shadow-1) transition-all',
                        'placeholder:text-(--text-tertiary)',
                        'hover:border-(--border-strong)',
                        'focus:border-(--border-focus) focus:outline-none focus:ring-4 focus:ring-[rgba(89,71,255,0.18)]',
                        'disabled:cursor-not-allowed disabled:opacity-60'
                    )}
                />

                {/* Predictions Dropdown */}
                {showPredictions && predictions.length > 0 && (
                    <div
                        role="listbox"
                        className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-(--border-default) bg-white shadow-(--shadow-card)"
                    >
                        {predictions.map((prediction, index) => (
                            <button
                                key={prediction.place_id}
                                id={`prediction-${index}`}
                                ref={(el) => {
                                    predictionRefs.current[index] = el;
                                }}
                                type="button"
                                role="option"
                                aria-selected={focusedPredictionIndex === index}
                                onClick={() => handlePredictionClick(prediction)}
                                className={cn(
                                    'flex w-full items-start gap-3 border-b border-(--border-subtle) px-4 py-3 text-left transition-colors last:border-b-0',
                                    'hover:bg-(--state-hover) focus:bg-(--state-selected) focus:outline-none',
                                    focusedPredictionIndex === index && 'bg-(--state-selected)'
                                )}
                            >
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-(--text-tertiary)" />
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

            {placeError && (
                <p className="text-xs text-red-600">{placeError}</p>
            )}
            {helperText && !placeError && (
                <p className="text-xs text-(--text-secondary)">{helperText}</p>
            )}
        </div>
    );
};
