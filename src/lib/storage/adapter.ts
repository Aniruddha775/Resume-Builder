import type { StorageAdapter } from '@/types/storage'
import { LocalStorageAdapter } from './local-storage'

export type { StorageAdapter }

export function createStorageAdapter(): StorageAdapter {
  return new LocalStorageAdapter()
}
