/**
 * SuperStoreProvider - Provider component for initializing and managing the SuperStore system
 * 
 * This component:
 * 1. Initializes the SuperStore on app startup
 * 2. Registers all existing stores with the SuperStore
 * 3. Provides debug tools and monitoring capabilities
 * 4. Handles SuperStore configuration and settings
 */

import React, { useEffect, useRef } from 'react';
import { useSuperStore, registerStore } from '../../store/superStore';

// Import all existing stores to register them
import { useToastStore } from '../../store/toastStore';
import { usePlannerStore } from '../PlannerCanvas/store/plannerStore';
import { useDashStore } from '../Dashboard/store';

const SuperStoreProvider = ({ children, enableDebugMode = false }) => {
  const initializationRef = useRef(false);
  const superStore = useSuperStore();

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initializationRef.current) return;
    initializationRef.current = true;

    console.log('🚀 SuperStoreProvider: Initializing SuperStore system...');

    // Register all existing Zustand stores
    const registeredStores = [];

    try {
      // Register toast store
      const toastStoreId = registerStore('toastStore', useToastStore, {
        type: 'zustand',
        persistent: false, // Toast notifications don't need persistence
        metadata: {
          description: 'Toast notification queue management',
          category: 'ui'
        }
      });
      if (toastStoreId) registeredStores.push(toastStoreId);

      // Register planner store (most important for data retention)
      const plannerStoreId = registerStore('plannerStore', usePlannerStore, {
        type: 'zustand',
        persistent: true, // Meal planning data should be persistent
        metadata: {
          description: 'Meal planning and nutrition tracking',
          category: 'business'
        }
      });
      if (plannerStoreId) registeredStores.push(plannerStoreId);

      // Register dashboard store
      const dashStoreId = registerStore('dashStore', useDashStore, {
        type: 'zustand',
        persistent: true, // UI preferences can be persistent
        metadata: {
          description: 'Dashboard UI state (drawer, search)',
          category: 'ui'
        }
      });
      if (dashStoreId) registeredStores.push(dashStoreId);

      console.log(`📦 SuperStore: Successfully registered ${registeredStores.length} stores:`, registeredStores);

      // Initialize the SuperStore with registered stores
      superStore.initializeSuperStore();

      // Take initial snapshot of all stores
      const initialSnapshot = superStore.takeSnapshot();
      if (initialSnapshot) {
        console.log('📸 SuperStore: Initial snapshot taken for', Object.keys(initialSnapshot).length, 'stores');
      }

      // Enable debug mode if requested
      if (enableDebugMode) {
        console.log('🐛 SuperStore: Debug mode enabled');
        superStore.updateMonitoringSettings({ 
          logChanges: true,
          enabled: true 
        });
        
        // Add global debug helpers
        if (typeof window !== 'undefined') {
          window.superStoreDebug = {
            store: superStore,
            takeSnapshot: () => superStore.takeSnapshot(),
            debugRegistry: () => superStore.debugStoreRegistry(),
            getAllStores: () => superStore.getAllStoresInfo(),
            exportData: () => superStore.exportStoreData(),
            restoreSnapshot: (storeName, index = 0) => superStore.restoreSnapshot(storeName, index)
          };
          console.log('🔧 SuperStore: Debug tools available at window.superStoreDebug');
        }
      }

    } catch (error) {
      console.error('❌ SuperStore: Error during initialization:', error);
    }

    // Set up auto-backup for persistent stores
    const autoBackupInterval = setInterval(() => {
      if (superStore.isRetentionEnabled) {
        const snapshot = superStore.takeSnapshot();
        if (snapshot && Object.keys(snapshot).length > 0) {
          console.log('💾 SuperStore: Auto-backup completed');
        }
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    // Cleanup function
    return () => {
      clearInterval(autoBackupInterval);
      console.log('🧹 SuperStore: Cleanup completed');
    };

  }, [superStore, enableDebugMode]);

  // Monitor SuperStore health
  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      const storesInfo = superStore.getAllStoresInfo();
      const healthStatus = {
        totalStores: storesInfo.length,
        activeStores: storesInfo.filter(store => store.type === 'zustand').length,
        persistentStores: storesInfo.filter(store => store.persistent).length,
        totalBackups: superStore.backupHistory.length,
        retentionEnabled: superStore.isRetentionEnabled
      };

      // Log health status in debug mode
      if (enableDebugMode) {
        console.log('🏥 SuperStore Health:', healthStatus);
      }

      // Alert on issues
      if (healthStatus.totalStores === 0) {
        console.warn('⚠️ SuperStore: No stores registered!');
      }

    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(healthCheckInterval);
  }, [superStore, enableDebugMode]);

  return (
    <>
      {children}
      {/* Optional: Render debug panel in development */}
      {enableDebugMode && process.env.NODE_ENV === 'development' && (
        <SuperStoreDebugPanel />
      )}
    </>
  );
};

// Optional debug panel component
const SuperStoreDebugPanel = () => {
  const superStore = useSuperStore();
  const [isVisible, setIsVisible] = React.useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '8px 12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        📦 SuperStore Debug
      </button>
    );
  }

  const storesInfo = superStore.getAllStoresInfo();

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '400px',
        maxHeight: '500px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        zIndex: 9999,
        overflow: 'auto',
        fontSize: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>📦 SuperStore Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Status:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
          <li>Stores: {storesInfo.length}</li>
          <li>Backups: {superStore.backupHistory.length}</li>
          <li>Retention: {superStore.isRetentionEnabled ? '✅' : '❌'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Registered Stores:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
          {storesInfo.map(store => (
            <li key={store.name}>
              {store.name} ({store.type}) 
              {store.persistent && ' 💾'}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => superStore.takeSnapshot()}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📸 Snapshot
        </button>
        <button
          onClick={() => superStore.debugStoreRegistry()}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔍 Debug Registry
        </button>
        <button
          onClick={() => superStore.toggleRetention()}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Toggle Retention
        </button>
      </div>
    </div>
  );
};

export default SuperStoreProvider;