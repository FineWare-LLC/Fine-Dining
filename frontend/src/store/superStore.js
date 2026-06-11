/**
 * SuperStore - Centralized data retention system for tracking all variable stores
 * 
 * This component provides:
 * 1. Tracking of all Zustand stores and Context providers
 * 2. Data retention and persistence mechanisms
 * 3. Store state monitoring and debugging capabilities
 * 4. Centralized state backup and restoration
 * 5. Cross-store data synchronization
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';


// Store registry to track all application stores
const storeRegistry = new Map();

// Store tracking utilities
export const registerStore = (storeName, storeHook, options = {}) => {
  if (storeRegistry.has(storeName)) {
    console.warn(`Store "${storeName}" is already registered. Skipping registration.`);
    return;
  }

  const storeInfo = {
    name: storeName,
    hook: storeHook,
    type: options.type || 'zustand', // 'zustand' | 'context'
    persistent: options.persistent || false,
    lastSnapshot: null,
    subscribers: new Set(),
    metadata: {
      createdAt: new Date().toISOString(),
      ...options.metadata
    }
  };

  storeRegistry.set(storeName, storeInfo);
  console.log(`📦 SuperStore: Registered store "${storeName}" (${storeInfo.type})`);

  // Subscribe to store changes for tracking
  if (storeInfo.type === 'zustand') {
    const unsubscribe = storeHook.subscribe((state) => {
      storeInfo.lastSnapshot = {
        timestamp: new Date().toISOString(),
        state: JSON.parse(JSON.stringify(state)) // Deep copy
      };
      
      // Notify SuperStore subscribers
      getSuperStore().getState().notifyStoreChange(storeName, state);
    });

    storeInfo.unsubscribe = unsubscribe;
  }

  return storeName;
};

// SuperStore implementation
export const useSuperStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Store registry and tracking
        registeredStores: [],
        storeSnapshots: new Map(),
        retentionSettings: {
          maxSnapshots: 100,
          retentionPeriodHours: 24,
          autoCleanup: true
        },

        // Data retention capabilities
        isRetentionEnabled: true,
        lastBackupTime: null,
        backupHistory: [],

        // Store monitoring
        monitoring: {
          enabled: true,
          logChanges: false,
          alertThresholds: {
            stateSize: 1024 * 1024, // 1MB
            changeFrequency: 100 // changes per minute
          }
        },

        // Methods for store management
        initializeSuperStore: () => {
          set((state) => {
            state.registeredStores = Array.from(storeRegistry.keys());
            console.log('🚀 SuperStore: Initialized with', state.registeredStores.length, 'stores');
          });
        },

        registerNewStore: (storeName, storeHook, options = {}) => {
          const registeredName = registerStore(storeName, storeHook, options);
          if (registeredName) {
            set((state) => {
              if (!state.registeredStores.includes(registeredName)) {
                state.registeredStores.push(registeredName);
              }
            });
          }
          return registeredName;
        },

        // Store snapshot management
        takeSnapshot: (storeName = null) => {
          const timestamp = new Date().toISOString();
          
          if (storeName) {
            // Single store snapshot
            const storeInfo = storeRegistry.get(storeName);
            if (!storeInfo) {
              console.warn(`Store "${storeName}" not found for snapshot`);
              return null;
            }

            const snapshot = {
              storeName,
              timestamp,
              state: storeInfo.type === 'zustand' ? storeInfo.hook.getState() : null,
              metadata: storeInfo.metadata
            };

            set((state) => {
              state.storeSnapshots.set(storeName, snapshot);
            });

            return snapshot;
          } else {
            // All stores snapshot
            const allSnapshots = {};
            
            storeRegistry.forEach((storeInfo, name) => {
              if (storeInfo.type === 'zustand') {
                allSnapshots[name] = {
                  timestamp,
                  state: storeInfo.hook.getState(),
                  metadata: storeInfo.metadata
                };
              }
            });

            set((state) => {
              state.lastBackupTime = timestamp;
              state.backupHistory.unshift({
                timestamp,
                snapshot: allSnapshots,
                storeCount: Object.keys(allSnapshots).length
              });

              // Limit backup history
              if (state.backupHistory.length > state.retentionSettings.maxSnapshots) {
                state.backupHistory = state.backupHistory.slice(0, state.retentionSettings.maxSnapshots);
              }
            });

            return allSnapshots;
          }
        },

        // Store restoration
        restoreSnapshot: (storeName, snapshotIndex = 0) => {
          const { backupHistory } = get();
          
          if (snapshotIndex >= backupHistory.length) {
            console.error('Snapshot index out of range');
            return false;
          }

          const backup = backupHistory[snapshotIndex];
          const storeSnapshot = backup.snapshot[storeName];
          
          if (!storeSnapshot) {
            console.error(`No snapshot found for store "${storeName}"`);
            return false;
          }

          const storeInfo = storeRegistry.get(storeName);
          if (!storeInfo || storeInfo.type !== 'zustand') {
            console.error(`Cannot restore non-Zustand store "${storeName}"`);
            return false;
          }

          // Restore the state
          storeInfo.hook.setState(storeSnapshot.state);
          console.log(`📦 SuperStore: Restored "${storeName}" from snapshot at ${storeSnapshot.timestamp}`);
          
          return true;
        },

        // Bulk restore all stores
        restoreAllStores: (snapshotIndex = 0) => {
          const { backupHistory } = get();
          
          if (snapshotIndex >= backupHistory.length) {
            console.error('Snapshot index out of range');
            return false;
          }

          const backup = backupHistory[snapshotIndex];
          let restoredCount = 0;

          Object.entries(backup.snapshot).forEach(([storeName, snapshot]) => {
            if (get().restoreSnapshot(storeName, snapshotIndex)) {
              restoredCount++;
            }
          });

          console.log(`📦 SuperStore: Restored ${restoredCount} stores from backup at ${backup.timestamp}`);
          return restoredCount > 0;
        },

        // Store monitoring and notifications
        notifyStoreChange: (storeName, newState) => {
          if (!get().monitoring.enabled) return;

          const stateSize = JSON.stringify(newState).length;
          const { alertThresholds } = get().monitoring;

          // Size monitoring
          if (stateSize > alertThresholds.stateSize) {
            console.warn(`📦 SuperStore: Store "${storeName}" state size (${stateSize} bytes) exceeds threshold`);
          }

          // Log changes if enabled
          if (get().monitoring.logChanges) {
            console.log(`📦 SuperStore: "${storeName}" state changed`, {
              timestamp: new Date().toISOString(),
              stateSize,
              preview: JSON.stringify(newState).substring(0, 100) + '...'
            });
          }

          // Trigger auto-snapshot if needed
          if (get().isRetentionEnabled && get().shouldAutoSnapshot(storeName)) {
            get().takeSnapshot(storeName);
          }
        },

        // Auto-snapshot logic
        shouldAutoSnapshot: (storeName) => {
          const storeInfo = storeRegistry.get(storeName);
          if (!storeInfo || !storeInfo.persistent) return false;

          const lastSnapshot = get().storeSnapshots.get(storeName);
          if (!lastSnapshot) return true;

          // Snapshot every 5 minutes for persistent stores
          const timeDiff = Date.now() - new Date(lastSnapshot.timestamp).getTime();
          return timeDiff > 5 * 60 * 1000; // 5 minutes
        },

        // Data cleanup
        cleanupOldData: () => {
          const { retentionSettings, backupHistory } = get();
          const cutoffTime = new Date(Date.now() - retentionSettings.retentionPeriodHours * 60 * 60 * 1000);

          set((state) => {
            state.backupHistory = state.backupHistory.filter(backup => 
              new Date(backup.timestamp) > cutoffTime
            );
          });

          console.log(`📦 SuperStore: Cleaned up old backups, ${get().backupHistory.length} remaining`);
        },

        // Configuration
        updateRetentionSettings: (newSettings) => {
          set((state) => {
            state.retentionSettings = { ...state.retentionSettings, ...newSettings };
          });
        },

        updateMonitoringSettings: (newSettings) => {
          set((state) => {
            state.monitoring = { ...state.monitoring, ...newSettings };
          });
        },

        toggleRetention: () => {
          set((state) => {
            state.isRetentionEnabled = !state.isRetentionEnabled;
          });
          
          console.log(`📦 SuperStore: Data retention ${get().isRetentionEnabled ? 'enabled' : 'disabled'}`);
        },

        // Store information getters
        getStoreInfo: (storeName) => {
          const storeInfo = storeRegistry.get(storeName);
          const snapshot = get().storeSnapshots.get(storeName);
          
          return {
            ...storeInfo,
            lastSnapshot: snapshot,
            currentState: storeInfo?.type === 'zustand' ? storeInfo.hook.getState() : null
          };
        },

        getAllStoresInfo: () => {
          return Array.from(storeRegistry.entries()).map(([name, info]) => ({
            name,
            ...info,
            lastSnapshot: get().storeSnapshots.get(name),
            currentState: info.type === 'zustand' ? info.hook.getState() : null
          }));
        },

        // Debug utilities
        debugStoreRegistry: () => {
          console.table(Array.from(storeRegistry.entries()).map(([name, info]) => ({
            name,
            type: info.type,
            persistent: info.persistent,
            createdAt: info.metadata.createdAt,
            hasSnapshot: get().storeSnapshots.has(name)
          })));
        },

        exportStoreData: (format = 'json') => {
          const data = {
            timestamp: new Date().toISOString(),
            stores: get().getAllStoresInfo().map(store => ({
              name: store.name,
              type: store.type,
              persistent: store.persistent,
              currentState: store.currentState,
              metadata: store.metadata
            })),
            backupHistory: get().backupHistory,
            settings: {
              retention: get().retentionSettings,
              monitoring: get().monitoring
            }
          };

          if (format === 'json') {
            return JSON.stringify(data, null, 2);
          }

          return data;
        }
      }),
      {
        name: 'super-store-persistence',
        partialize: (state) => ({
          retentionSettings: state.retentionSettings,
          monitoring: state.monitoring,
          isRetentionEnabled: state.isRetentionEnabled,
          backupHistory: state.backupHistory.slice(0, 10) // Keep only last 10 backups in persistence
        })
      }
    )
  )
);

// Helper to get the SuperStore instance
export const getSuperStore = () => useSuperStore;

// Auto-initialize cleanup interval
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useSuperStore.getState();
    if (store.retentionSettings.autoCleanup) {
      store.cleanupOldData();
    }
  }, 60 * 60 * 1000); // Run cleanup every hour
}