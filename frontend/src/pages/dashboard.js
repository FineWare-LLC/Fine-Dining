/**
 * Dashboard page — orchestrates all dashboard atoms.
 */
import React, { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Box, CssBaseline, useTheme } from '@mui/material';
import NewHeader from '../components/dashboard/NewHeader';
import GreetingSegment from '../components/dashboard/GreetingSegment';
import DailySummary from '../components/dashboard/DailySummary';
import MealCard from '../components/dashboard/MealCard';
import DiscoveryHeader from '../components/dashboard/DiscoveryHeader';
import RestaurantCard from '../components/dashboard/RestaurantCard';
import BottomSearchRail from '../components/dashboard/BottomSearchRail';
import NewNavigationDrawer from '../components/dashboard/NewNavigationDrawer';
import { useDashStore } from '../components/dashboard/store';
import { useAuth } from '../context/AuthContext';

/* ------------------------------------------------------------------------ */
/* Mock fetchers – replace with real data hooks or GraphQL queries.         */
const useMeal = () => ({
  title:'Grilled Salmon Bowl',
  calories:540,
  protein:38,
  imageUrl:'https://source.unsplash.com/800x600/?salmon',
  tags:['Omega‑3','Low Carb'],
});
const useRestaurants = () => [
  { id:1, name:'Blue Lagoon', cuisine:'Seafood', imageUrl:'https://source.unsplash.com/400x300/?restaurant' },
  { id:2, name:'Teal Taco',  cuisine:'Mexican', imageUrl:'https://source.unsplash.com/400x300/?taco' },
];
/* ------------------------------------------------------------------------ */

export default function Dashboard() {
  // auth redirect stub
  /* const { isAuthenticated, loading } = useAuth();
  useEffect(()=>{ if (!loading && !isAuthenticated) router.push('/login'); },[loading]); */
  const { user: currentUser } = useAuth();

  const meal        = useMeal();
  const restaurants = useRestaurants();
  const theme       = useTheme();
  const searchTerm  = useDashStore(s => s.searchTerm);

  const filtered = useMemo(
    () => restaurants.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [restaurants, searchTerm],
  );

  return (
    <>
      <Head><title>Fine Dining Dashboard</title></Head>
      <CssBaseline />
      <NewHeader user={currentUser} />
      <Box
        component="main"
        sx={{
          pt:`calc(${theme.mixins.toolbar.minHeight}px + 8px)`,
          pb:'90px',
          px:2,
          display:'flex',
          flexDirection:'column',
        }}
      >
        <GreetingSegment userName={currentUser?.name || 'Guest'} />
        <DailySummary meal={meal} />
        <MealCard meal={meal} />
        <DiscoveryHeader />
        {filtered.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
      </Box>
      <BottomSearchRail />
      <NewNavigationDrawer />
    </>
  );
}
