/**
 * IndexedDB 离线高清媒体存储引擎 (culinary_media_db_v1)
 * 避免将大型烹饪实拍视频或大图直接以 Base64 塞入 5MB 上限的 localStorage 导致静默丢数据
 */

const DB_NAME = 'culinary_media_db_v1';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

export const IDB_URI_PREFIX = 'idb://';
export const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024; // 25MB 视频大小限制

interface StoredMediaRecord {
  id: string;
  blob: Blob;
  mimeType: string;
  size: number;
  createdAt: number;
}

// 缓存已创建的 ObjectURL，避免重复创建导致闪烁
const objectUrlCache = new Map<string, string>();

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('当前运行环境不支持 IndexedDB'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('打开 IndexedDB 失败'));
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const header = parts[0] || '';
  const base64 = parts[1] || '';
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/**
 * 将视频或大型媒体文件存入 IndexedDB，返回形如 idb://media_xxx 的轻量引用 URI
 */
export async function saveMediaBlobToIDB(
  fileOrDataUrl: Blob | string,
  prefix: string = 'media'
): Promise<string> {
  const blob = typeof fileOrDataUrl === 'string' ? dataUrlToBlob(fileOrDataUrl) : fileOrDataUrl;
  const id = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const db = await openMediaDB();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record: StoredMediaRecord = {
      id,
      blob,
      mimeType: blob.type || 'video/mp4',
      size: blob.size,
      createdAt: Date.now(),
    };
    const putReq = store.put(record);
    putReq.onsuccess = () => resolve();
    putReq.onerror = () => reject(putReq.error || new Error('写入 IndexedDB 媒体库失败'));
  });

  db.close();
  const uri = `${IDB_URI_PREFIX}${id}`;
  // 预热缓存，保证上传后立即预览零延迟
  const objectUrl = URL.createObjectURL(blob);
  objectUrlCache.set(uri, objectUrl);
  return uri;
}

/**
 * 将 idb://media_xxx 解析为浏览器可播放的 ObjectURL；普通 http/https/data URI 原样返回
 */
export async function resolveMediaUrl(uri?: string): Promise<string | undefined> {
  if (!uri) return undefined;
  if (!uri.startsWith(IDB_URI_PREFIX)) return uri;

  const cached = objectUrlCache.get(uri);
  if (cached) return cached;

  const id = uri.slice(IDB_URI_PREFIX.length);
  try {
    const db = await openMediaDB();
    const record = await new Promise<StoredMediaRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);
      getReq.onsuccess = () => resolve(getReq.result as StoredMediaRecord | undefined);
      getReq.onerror = () => reject(getReq.error);
    });
    db.close();

    if (record?.blob) {
      const objectUrl = URL.createObjectURL(record.blob);
      objectUrlCache.set(uri, objectUrl);
      return objectUrl;
    }
  } catch (err) {
    console.warn('读取 IndexedDB 媒体资源失败:', err);
  }
  return undefined;
}

/**
 * 删除 IndexedDB 中指定的媒体资源
 */
export async function deleteMediaFromIDB(uri?: string): Promise<void> {
  if (!uri || !uri.startsWith(IDB_URI_PREFIX)) return;
  const cached = objectUrlCache.get(uri);
  if (cached) {
    URL.revokeObjectURL(cached);
    objectUrlCache.delete(uri);
  }
  const id = uri.slice(IDB_URI_PREFIX.length);
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const delReq = store.delete(id);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    });
    db.close();
  } catch (err) {
    console.warn('清理 IndexedDB 媒体失败:', err);
  }
}

export interface StorageHealthMetrics {
  localStorageBytes: number;
  localStorageLimitBytes: number;
  indexedDBBytes: number;
  indexedDBItemCount: number;
  browserQuotaBytes?: number;
  browserUsageBytes?: number;
}

/**
 * 统计当前设备 localStorage 与 IndexedDB 占用体积，供数据安全页展示
 */
export async function estimateTotalStorageUsage(): Promise<StorageHealthMetrics> {
  let localStorageBytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        localStorageBytes += (key.length + val.length) * 2; // UTF-16 bytes
      }
    }
  } catch {
    // ignore
  }

  let indexedDBBytes = 0;
  let indexedDBItemCount = 0;
  try {
    const db = await openMediaDB();
    const records = await new Promise<StoredMediaRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => resolve((getAllReq.result as StoredMediaRecord[]) || []);
      getAllReq.onerror = () => reject(getAllReq.error);
    });
    db.close();
    indexedDBItemCount = records.length;
    indexedDBBytes = records.reduce((sum, r) => sum + (r.size || r.blob?.size || 0), 0);
  } catch {
    // ignore
  }

  let browserQuotaBytes: number | undefined;
  let browserUsageBytes: number | undefined;
  try {
    if (navigator.storage && typeof navigator.storage.estimate === 'function') {
      const est = await navigator.storage.estimate();
      browserQuotaBytes = est.quota;
      browserUsageBytes = est.usage;
    }
  } catch {
    // ignore
  }

  return {
    localStorageBytes,
    localStorageLimitBytes: 5 * 1024 * 1024, // 标准浏览器 5MB 警戒线
    indexedDBBytes,
    indexedDBItemCount,
    browserQuotaBytes,
    browserUsageBytes,
  };
}
