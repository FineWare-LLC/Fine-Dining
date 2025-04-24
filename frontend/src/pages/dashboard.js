/**
 * Dashboard page — orchestrates all dashboard atoms.
 */
import React, { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Box, CssBaseline, useTheme } from '@mui/material';
import NewHeader from '@/components/Dashboard/NewHeader';
import GreetingSegment from '@/components/Dashboard/GreetingSegment';
import DailySummary from '@/components/Dashboard/DailySummary';
import MealCard from '@/components/Dashboard/MealCard';
import DiscoveryHeader from '@/components/Dashboard/DiscoveryHeader';
import RestaurantCard from '@/components/Dashboard/RestaurantCard';
import BottomSearchRail from "@/components/Dashboard/BottomSearchRail.js";
import NewNavigationDrawer from '@/components/Dashboard/NewNavigationDrawer';
import { useDashStore } from '@/components/Dashboard/store';

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
      <NewHeader user={{ name:'Anthony Fine'}} />
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
        <GreetingSegment userName="Anthony" />
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