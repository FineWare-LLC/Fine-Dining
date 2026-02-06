/**
 * SuperStore Integration Tests
 * 
 * Tests to verify the SuperStore system is working correctly:
 * 1. Store registration
 * 2. Data retention capabilities
 * 3. Snapshot/restore functionality
 * 4. Store tracking and monitoring
 */

import { renderHook, act } from '@testing-library/react';
import { useSuperStore, registerStore, getSuperStore } from '../store/superStore';
import { useToastStore } from '../store/toastStore';
import { create } from 'zustand';

// Create a mock store for testing
const useMockStore = create((set) => ({
  count: 0,
  message: 'test',
  increment: () => set((state) => ({ count: state.count + 1 })),
  setMessage: (msg) => set({ message: msg })
}));

describe('SuperStore System', () => {
  beforeEach(() => {
    // Reset SuperStore state before each test
    const superStore = getSuperStore().getState();
    superStore.registeredStores.length = 0;
    superStore.storeSnapshots.clear();
    superStore.backupHistory.length = 0;
  });

  describe('Store Registration', () => {
    it('should register a Zustand store successfully', () => {
      const storeName = registerStore('mockStore', useMockStore, {
        type: 'zustand',
        persistent: true,
        metadata: { description: 'Mock store for testing' }
      });

      expect(storeName).toBe('mockStore');
      
      const superStore = getSuperStore().getState();
      expect(superStore.registeredStores).toContain('mockStore');
    });

    it('should prevent duplicate store registration', () => {
      // Register store twice
      registerStore('mockStore', useMockStore);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      registerStore('mockStore', useMockStore);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Store "mockStore" is already registered. Skipping registration.'
      );
      
      consoleSpy.mockRestore();
    });

    it('should track store metadata correctly', () => {
      const metadata = { 
        description: 'Test store', 
        category: 'testing',
        version: '1.0.0'
      };
      
      registerStore('testStore', useMockStore, { 
        type: 'zustand',
        persistent: true,
        metadata 
      });

      const { result } = renderHook(() => useSuperStore());
      const storeInfo = result.current.getStoreInfo('testStore');
      
      expect(storeInfo.metadata.description).toBe('Test store');
      expect(storeInfo.metadata.category).toBe('testing');
      expect(storeInfo.metadata.version).toBe('1.0.0');
      expect(storeInfo.persistent).toBe(true);
    });
  });

  describe('Snapshot Management', () => {
    beforeEach(() => {
      registerStore('mockStore', useMockStore, { persistent: true });
    });

    it('should take snapshots of individual stores', () => {
      const { result } = renderHook(() => useSuperStore());
      
      act(() => {
        const snapshot = result.current.takeSnapshot('mockStore');
        expect(snapshot).toBeTruthy();
        expect(snapshot.storeName).toBe('mockStore');
        expect(snapshot.state).toBeTruthy();
        expect(snapshot.timestamp).toBeTruthy();
      });
    });

    it('should take snapshots of all stores', () => {
      registerStore('mockStore2', useMockStore);
      const { result } = renderHook(() => useSuperStore());
      
      act(() => {
        const snapshots = result.current.takeSnapshot();
        expect(Object.keys(snapshots)).toContain('mockStore');
        expect(Object.keys(snapshots)).toContain('mockStore2');
      });
    });

    it('should maintain backup history', () => {
      const { result } = renderHook(() => useSuperStore());
      
      act(() => {
        result.current.takeSnapshot(); // All stores
        result.current.takeSnapshot(); // All stores again
      });
      
      expect(result.current.backupHistory).toHaveLength(2);
      expect(result.current.backupHistory[0].timestamp).toBeTruthy();
      expect(result.current.backupHistory[0].storeCount).toBeGreaterThan(0);
    });
  });

  describe('Store Restoration', () => {
    beforeEach(() => {
      registerStore('mockStore', useMockStore, { persistent: true });
    });

    it('should restore store state from snapshot', async () => {
      const { result } = renderHook(() => useSuperStore());
      
      // Change store state
      act(() => {
        useMockStore.getState().increment();
        useMockStore.getState().setMessage('changed');
      });

      // Take snapshot
      act(() => {
        result.current.takeSnapshot();
      });

      // Change state again
      act(() => {
        useMockStore.getState().increment();
        useMockStore.getState().setMessage('changed again');
      });

      const currentState = useMockStore.getState();
      expect(currentState.count).toBe(2);
      expect(currentState.message).toBe('changed again');

      // Restore from snapshot
      act(() => {
        const restored = result.current.restoreSnapshot('mockStore', 0);
        expect(restored).toBe(true);
      });

      const restoredState = useMockStore.getState();
      expect(restoredState.count).toBe(1);
      expect(restoredState.message).toBe('changed');
    });

    it('should handle invalid restore requests', () => {
      const { result } = renderHook(() => useSuperStore());
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      act(() => {
        const restored = result.current.restoreSnapshot('nonexistent', 0);
        expect(restored).toBe(false);
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Data Retention Settings', () => {
    it('should update retention settings', () => {
      const { result } = renderHook(() => useSuperStore());
      
      act(() => {
        result.current.updateRetentionSettings({
          maxSnapshots: 50,
          retentionPeriodHours: 12,
          autoCleanup: false
        });
      });
      
      expect(result.current.retentionSettings.maxSnapshots).toBe(50);
      expect(result.current.retentionSettings.retentionPeriodHours).toBe(12);
      expect(result.current.retentionSettings.autoCleanup).toBe(false);
    });

    it('should toggle retention on/off', () => {
      const { result } = renderHook(() => useSuperStore());
      const initialState = result.current.isRetentionEnabled;
      
      act(() => {
        result.current.toggleRetention();
      });
      
      expect(result.current.isRetentionEnabled).toBe(!initialState);
    });
  });

  describe('Monitoring and Debugging', () => {
    beforeEach(() => {
      registerStore('mockStore', useMockStore);
    });

    it('should track store information', () => {
      const { result } = renderHook(() => useSuperStore());
      
      const allStores = result.current.getAllStoresInfo();
      expect(allStores).toHaveLength(1);
      expect(allStores[0].name).toBe('mockStore');
      expect(allStores[0].type).toBe('zustand');
    });

    it('should export store data', () => {
      const { result } = renderHook(() => useSuperStore());
      
      const exportedData = result.current.exportStoreData('object');
      expect(exportedData.timestamp).toBeTruthy();
      expect(exportedData.stores).toHaveLength(1);
      expect(exportedData.settings).toBeTruthy();
    });

    it('should update monitoring settings', () => {
      const { result } = renderHook(() => useSuperStore());
      
      act(() => {
        result.current.updateMonitoringSettings({
          enabled: false,
          logChanges: true,
          alertThresholds: { stateSize: 2048 }
        });
      });
      
      expect(result.current.monitoring.enabled).toBe(false);
      expect(result.current.monitoring.logChanges).toBe(true);
      expect(result.current.monitoring.alertThresholds.stateSize).toBe(2048);
    });
  });

  describe('Real Store Integration', () => {
    it('should work with actual toast store', () => {
      const storeName = registerStore('toastStore', useToastStore, {
        type: 'zustand',
        persistent: false,
        metadata: { description: 'Toast notification system' }
      });

      expect(storeName).toBe('toastStore');
      
      const { result } = renderHook(() => useSuperStore());
      const storeInfo = result.current.getStoreInfo('toastStore');
      
      expect(storeInfo.name).toBe('toastStore');
      expect(storeInfo.type).toBe('zustand');
      expect(storeInfo.persistent).toBe(false);
    });

    it('should take snapshots of real stores', () => {
      registerStore('toastStore', useToastStore);
      
      const { result } = renderHook(() => useSuperStore());
      
      act(() => {
        const snapshot = result.current.takeSnapshot('toastStore');
        expect(snapshot).toBeTruthy();
        expect(snapshot.state).toHaveProperty('toasts');
        expect(snapshot.state).toHaveProperty('queue');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle store changes gracefully', () => {
      const { result } = renderHook(() => useSuperStore());
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Try to notify change for non-existent store
      act(() => {
        result.current.notifyStoreChange('nonexistent', { test: true });
      });
      
      // Should not throw error
      expect(() => {
        result.current.notifyStoreChange('nonexistent', { test: true });
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle cleanup operations safely', () => {
      const { result } = renderHook(() => useSuperStore());
      
      // Should not throw even with no data
      expect(() => {
        result.current.cleanupOldData();
      }).not.toThrow();
    });
  });
});

// Integration test to verify the system works end-to-end
describe('SuperStore End-to-End Integration', () => {
  it('should provide complete store management lifecycle', () => {
    // 1. Register stores
    registerStore('testStore1', useMockStore, { persistent: true });
    registerStore('testStore2', create(() => ({ value: 42 })), { persistent: false });
    
    const { result } = renderHook(() => useSuperStore());
    
    // 2. Initialize SuperStore
    act(() => {
      result.current.initializeSuperStore();
    });
    
    // 3. Verify stores are tracked
    expect(result.current.registeredStores).toContain('testStore1');
    expect(result.current.registeredStores).toContain('testStore2');
    
    // 4. Take snapshots
    act(() => {
      result.current.takeSnapshot();
    });
    
    expect(result.current.backupHistory).toHaveLength(1);
    
    // 5. Modify settings
    act(() => {
      result.current.updateRetentionSettings({ maxSnapshots: 25 });
      result.current.updateMonitoringSettings({ logChanges: true });
    });
    
    expect(result.current.retentionSettings.maxSnapshots).toBe(25);
    expect(result.current.monitoring.logChanges).toBe(true);
    
    // 6. Export data
    const exportData = result.current.exportStoreData();
    expect(typeof exportData).toBe('string');
    expect(JSON.parse(exportData)).toHaveProperty('stores');
    
    // 7. Cleanup
    act(() => {
      result.current.cleanupOldData();
    });
    
    console.log('✅ SuperStore end-to-end integration test completed successfully');
  });
});