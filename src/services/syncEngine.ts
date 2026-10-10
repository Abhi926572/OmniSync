/**
 * Real-time Cross-Device Synchronization Engine
 * BroadcastChannel + Offline Mutation Queue + Conflict Resolution
 */

import { PairedDevice, SyncMutation, SyncState, NetworkCondition } from '../types';
import { localDB } from './storage';

export type SyncEventListener = (event: {
  type: string;
  payload: any;
  originDeviceId: string;
}) => void;

class SyncEngine {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncEventListener> = new Set();
  private currentDeviceId: string;
  private syncState: SyncState = 'synced';
  private networkCondition: NetworkCondition = 'online';

  constructor() {
    this.currentDeviceId = this.getOrCreateDeviceId();
    this.initChannel();
  }

  private getOrCreateDeviceId(): string {
    let id = localStorage.getItem('omnisync_device_id');
    if (!id) {
      id = `dev_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('omnisync_device_id', id);
    }
    return id;
  }

  getDeviceId(): string {
    return this.currentDeviceId;
  }

  private initChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('omnisync_sync_bus');
        this.channel.onmessage = (event) => {
          const data = event.data;
          if (data && data.originDeviceId !== this.currentDeviceId) {
            this.notifyListeners(data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel unavailable', e);
      }
    }
  }

  subscribe(listener: SyncEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(event: { type: string; payload: any; originDeviceId: string }) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Sync listener error:', err);
      }
    });
  }

  broadcast(type: string, payload: any) {
    const packet = {
      type,
      payload,
      originDeviceId: this.currentDeviceId,
      timestamp: Date.now(),
    };
    if (this.channel) {
      try {
        this.channel.postMessage(packet);
      } catch (e) {
        console.warn('Broadcast failed:', e);
      }
    }
  }

  setNetworkCondition(condition: NetworkCondition) {
    this.networkCondition = condition;
    if (condition === 'offline') {
      this.syncState = 'offline';
    } else {
      this.syncState = 'synced';
    }
  }

  getNetworkCondition(): NetworkCondition {
    return this.networkCondition;
  }

  getSyncState(): SyncState {
    return this.syncState;
  }

  async recordMutation(mutation: Omit<SyncMutation, 'id' | 'timestamp' | 'revision'>): Promise<SyncMutation> {
    const fullMutation: SyncMutation = {
      ...mutation,
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      revision: Date.now(),
    };

    if (this.networkCondition === 'offline') {
      await localDB.put('mutations', fullMutation);
      this.syncState = 'pending';
    } else {
      // Simulate real-time broadcast to all devices
      this.broadcast('mutation', fullMutation);
      this.syncState = 'synced';
    }

    return fullMutation;
  }

  async flushPendingMutations(): Promise<number> {
    const pending = await localDB.getAll<SyncMutation>('mutations');
    if (pending.length === 0) return 0;

    this.syncState = 'syncing';
    // Simulate low-latency batch processing
    await new Promise((r) => setTimeout(r, 400));

    for (const m of pending) {
      this.broadcast('mutation', m);
      await localDB.delete('mutations', m.id);
    }

    this.syncState = 'synced';
    return pending.length;
  }
}

export const syncEngine = new SyncEngine();

export const INITIAL_DEVICES: PairedDevice[] = [
  {
    id: 'dev_current',
    name: 'MacBook Pro 16" (M3 Max)',
    type: 'laptop',
    platform: 'macOS Sonoma · Chrome 132',
    lastSyncAt: Date.now(),
    isCurrent: true,
    ipAddress: '192.168.1.42 (Local)',
    batteryLevel: 94,
    isOnline: true,
  },
  {
    id: 'dev_mobile_1',
    name: 'iPhone 16 Pro',
    type: 'mobile',
    platform: 'iOS 18.2 · Safari Mobile',
    lastSyncAt: Date.now() - 42000,
    isCurrent: false,
    ipAddress: '172.56.21.90 (5G Ultra)',
    batteryLevel: 82,
    isOnline: true,
  },
  {
    id: 'dev_tablet_1',
    name: 'iPad Pro 13" (M4)',
    type: 'tablet',
    platform: 'iPadOS 18.1 · PWA Standalone',
    lastSyncAt: Date.now() - 320000,
    isCurrent: false,
    ipAddress: '192.168.1.108 (Wi-Fi 6E)',
    batteryLevel: 67,
    isOnline: true,
  },
  {
    id: 'dev_desktop_1',
    name: 'Linux Dev Station',
    type: 'desktop',
    platform: 'Ubuntu 24.04 LTS · Firefox 133',
    lastSyncAt: Date.now() - 1440000,
    isCurrent: false,
    ipAddress: '10.0.0.15 (Ethernet 10G)',
    batteryLevel: 100,
    isOnline: true,
  },
];
