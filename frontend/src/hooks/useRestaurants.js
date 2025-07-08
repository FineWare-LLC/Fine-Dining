/**
 * Custom hook for managing restaurant data and geolocation
 * Handles restaurant fetching, caching, and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import { getRestaurantSearchCoordinates, clearCoordinatesCache } from '@/utils/geolocation';
import { useDashStore } from '@/components/Dashboard/store';

const FIND_NEARBY_RESTAURANTS = gql`
  query FindNearbyRestaurants(
    $latitude: Float!
    $longitude: Float!
    $radius: Int!
    $keyword: String
  ) {
    findNearbyRestaurants(
      latitude: $latitude
      longitude: $longitude
      radius: $radius
      keyword: $keyword
    ) {
      source
      restaurants {
        placeId
        name
        vicinity
        rating
        userRatingsTotal
        location {
          latitude
          longitude
        }
      }
    }
  }
`;

/**
 * Custom hook for restaurant management
 * @param {Object} options - Configuration options
 * @param {number} options.radius - Search radius in meters (default: 1500)
 * @param {boolean} options.autoFetch - Whether to automatically fetch on mount (default: true)
 * @returns {Object} Restaurant data and control functions
 */
export const useRestaurants = (options = {}) => {
  const { radius = 1500, autoFetch = true } = options;
  
  const [coordinates, setCoordinates] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const searchTerm = useDashStore(s => s.searchTerm);

  const [fetchRestaurants, {
    loading: restaurantsLoading,
    error: restaurantsError,
    data: restaurantsData,
  }] = useLazyQuery(FIND_NEARBY_RESTAURANTS, {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  // Extract restaurant data from GraphQL response
  const { restaurants = [], source } = restaurantsData?.findNearbyRestaurants || {};

  // Filter restaurants based on search term
  const filteredRestaurants = restaurants.filter((restaurant) =>
    (restaurant.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch coordinates and restaurants
  const loadRestaurants = useCallback(async (forceRefresh = false) => {
    setIsLoadingLocation(true);
    
    try {
      const coords = await getRestaurantSearchCoordinates(forceRefresh);
      setCoordinates(coords);
      
      await fetchRestaurants({
        variables: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          radius,
        },
      });
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [fetchRestaurants, radius]);

  // Retry function for error recovery
  const retryRestaurants = useCallback(() => {
    loadRestaurants(true); // Force refresh coordinates
  }, [loadRestaurants]);

  // Clear location cache and reload
  const refreshLocation = useCallback(() => {
    clearCoordinatesCache();
    loadRestaurants(true);
  }, [loadRestaurants]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      loadRestaurants();
    }
  }, [autoFetch, loadRestaurants]);

  // Loading state combines location loading and restaurant loading
  const isLoading = isLoadingLocation || restaurantsLoading;

  return {
    // Data
    restaurants: filteredRestaurants,
    allRestaurants: restaurants,
    source,
    coordinates,
    
    // Loading states
    isLoading,
    isLoadingLocation,
    restaurantsLoading,
    
    // Error states
    restaurantsError,
    
    // Actions
    loadRestaurants,
    retryRestaurants,
    refreshLocation,
    
    // Computed values
    hasRestaurants: filteredRestaurants.length > 0,
    hasError: !!restaurantsError,
    isEmpty: !isLoading && !restaurantsError && filteredRestaurants.length === 0,
  };
};

export default useRestaurants;