/**
 * SuperStore Verification Script
 * 
 * This script provides manual verification of the SuperStore system
 * Can be run in browser console or as a standalone verification
 */

import { useSuperStore, registerStore } from '../store/superStore';
import { useToastStore } from '../store/toastStore';
import { create } from 'zustand';

// Simple test store for verification
const useTestStore = create((set, get) => ({
  count: 0,
  message: 'initial',
  increment: () => set(state => ({ count: state.count + 1 })),
  setMessage: (msg) => set({ message: msg }),
  reset: () => set({ count: 0, message: 'initial' })
}));

export const verifySuperStore = async () => {
  console.log('🧪 Starting SuperStore verification...');
  
  const results = {
    registration: false,
    snapshots: false,
    restoration: false,
    monitoring: false,
    persistence: false,
    errors: []
  };
  
  try {
    // Test 1: Store Registration
    console.log('📝 Testing store registration...');
    const storeName = registerStore('testVerificationStore', useTestStore, {
      type: 'zustand',
      persistent: true,
      metadata: { description: 'Verification test store' }
    });
    
    if (storeName === 'testVerificationStore') {
      results.registration = true;
      console.log('✅ Store registration successful');
    } else {
      throw new Error('Store registration failed');
    }
    
    // Test 2: SuperStore functionality
    console.log('📸 Testing snapshot functionality...');
    const superStore = useSuperStore.getState();
    
    // Initialize SuperStore
    superStore.initializeSuperStore();
    
    // Take snapshot
    const snapshot = superStore.takeSnapshot('testVerificationStore');
    if (snapshot && snapshot.storeName === 'testVerificationStore') {
      results.snapshots = true;
      console.log('✅ Snapshot functionality working');
    } else {
      throw new Error('Snapshot functionality failed');
    }
    
    // Test 3: State restoration
    console.log('🔄 Testing state restoration...');
    
    // Modify store state
    useTestStore.getState().increment();
    useTestStore.getState().setMessage('modified');
    
    // Take another snapshot
    superStore.takeSnapshot();
    
    // Modify again
    useTestStore.getState().increment();
    useTestStore.getState().setMessage('modified again');
    
    const beforeRestore = useTestStore.getState();
    console.log('Before restore:', beforeRestore);
    
    // Restore from previous snapshot
    const restored = superStore.restoreSnapshot('testVerificationStore', 0);
    
    if (restored) {
      const afterRestore = useTestStore.getState();
      console.log('After restore:', afterRestore);
      
      if (afterRestore.message === 'modified' && afterRestore.count === 1) {
        results.restoration = true;
        console.log('✅ State restoration working');
      } else {
        throw new Error('State restoration failed - state not properly restored');
      }
    } else {
      throw new Error('State restoration failed');
    }
    
    // Test 4: Monitoring and settings
    console.log('📊 Testing monitoring and settings...');
    
    // Update settings
    superStore.updateRetentionSettings({
      maxSnapshots: 50,
      retentionPeriodHours: 12
    });
    
    superStore.updateMonitoringSettings({
      logChanges: true,
      enabled: true
    });
    
    if (superStore.retentionSettings.maxSnapshots === 50 && 
        superStore.monitoring.logChanges === true) {
      results.monitoring = true;
      console.log('✅ Monitoring and settings working');
    } else {
      throw new Error('Monitoring and settings failed');
    }
    
    // Test 5: Persistence check (basic)
    console.log('💾 Testing persistence capabilities...');
    
    const exportedData = superStore.exportStoreData('object');
    if (exportedData && 
        exportedData.stores && 
        exportedData.stores.length > 0 &&
        exportedData.settings) {
      results.persistence = true;
      console.log('✅ Persistence capabilities working');
    } else {
      throw new Error('Persistence capabilities failed');
    }
    
    // Test 6: Real store integration
    console.log('🔗 Testing real store integration...');
    
    // Register actual toast store
    registerStore('toastStoreVerification', useToastStore, {
      type: 'zustand',
      persistent: false,
      metadata: { description: 'Toast store verification' }
    });
    
    const toastSnapshot = superStore.takeSnapshot('toastStoreVerification');
    if (toastSnapshot && toastSnapshot.state && 
        typeof toastSnapshot.state.toasts !== 'undefined') {
      console.log('✅ Real store integration working');
    } else {
      console.warn('⚠️ Real store integration may have issues');
    }
    
    // Summary
    console.log('\n🎉 SuperStore Verification Complete!');
    console.log('Results:', results);
    
    const successCount = Object.values(results).filter(r => r === true).length;
    const totalTests = Object.keys(results).filter(k => k !== 'errors').length;
    
    console.log(`✅ ${successCount}/${totalTests} tests passed`);
    
    if (results.errors.length > 0) {
      console.log('❌ Errors encountered:', results.errors);
    }
    
    // Log store registry for debugging
    console.log('\n📋 Current store registry:');
    superStore.debugStoreRegistry();
    
    // Log system status
    console.log('\n📊 SuperStore system status:');
    console.log({
      registeredStores: superStore.registeredStores.length,
      backupHistory: superStore.backupHistory.length,
      retentionEnabled: superStore.isRetentionEnabled,
      monitoringEnabled: superStore.monitoring.enabled
    });
    
    return {
      success: successCount === totalTests && results.errors.length === 0,
      results,
      successCount,
      totalTests
    };
    
  } catch (error) {
    console.error('❌ SuperStore verification failed:', error);
    results.errors.push(error.message);
    return {
      success: false,
      error: error.message,
      results
    };
  }
};

// Browser console helper
if (typeof window !== 'undefined') {
  window.verifySuperStore = verifySuperStore;
  console.log('🔧 SuperStore verification available at: window.verifySuperStore()');
}

export default verifySuperStore;