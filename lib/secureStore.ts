import * as SecureStore from 'expo-secure-store';

const MAX_CHUNK_SIZE = 2000; // Keep safely below the 2048-byte limit

/**
 * A wrapper around expo-secure-store that handles chunking for values larger than 2048 bytes.
 * It remains 100% backward-compatible: small values are written directly, and legacy
 * unchunked data is read normally.
 */
export const ChunkedSecureStore = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const mainValue = await SecureStore.getItemAsync(key);
      if (!mainValue) return null;

      // Check if this value is chunked
      if (mainValue.startsWith('__chunked__:')) {
        const count = parseInt(mainValue.split(':')[1], 10);
        if (isNaN(count)) return null;

        const chunks: string[] = [];
        for (let i = 0; i < count; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          if (chunk === null) {
            // If any chunk is missing, the data is corrupted/incomplete
            console.warn(`[ChunkedSecureStore] Chunk ${i} is missing for key: ${key}`);
            return null;
          }
          chunks.push(chunk);
        }
        return chunks.join('');
      }

      // Return legacy or unchunked value directly
      return mainValue;
    } catch (error) {
      console.error('[ChunkedSecureStore] Error getting item:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Clean up any existing chunks first (e.g. if the new value is smaller or not chunked)
      await ChunkedSecureStore.removeItem(key);

      if (value.length <= MAX_CHUNK_SIZE) {
        // If it fits in a single chunk, store it normally under the main key
        await SecureStore.setItemAsync(key, value);
      } else {
        // Split value into chunks
        const chunks: string[] = [];
        for (let i = 0; i < value.length; i += MAX_CHUNK_SIZE) {
          chunks.push(value.substring(i, i + MAX_CHUNK_SIZE));
        }

        // Store each chunk under key_chunk_i
        for (let i = 0; i < chunks.length; i++) {
          await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
        }

        // Store the manifest under the main key
        await SecureStore.setItemAsync(key, `__chunked__:${chunks.length}`);
      }
    } catch (error) {
      console.error('[ChunkedSecureStore] Error setting item:', error);
      throw error;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      // Retrieve the main value to see if there are chunks to clean up
      const mainValue = await SecureStore.getItemAsync(key);
      if (mainValue && mainValue.startsWith('__chunked__:')) {
        const count = parseInt(mainValue.split(':')[1], 10);
        if (!isNaN(count)) {
          for (let i = 0; i < count; i++) {
            await SecureStore.deleteItemAsync(`${key}_chunk_${i}`).catch(() => {});
          }
        }
      }
      
      // Delete the main key
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('[ChunkedSecureStore] Error removing item:', error);
    }
  }
};
