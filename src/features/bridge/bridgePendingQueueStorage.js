import { STORAGE_KEYS } from "../../shared/constants/storageKeys.js";
import { loadJson, saveJson } from "../../shared/storage/localJsonStorage.js";

const QUEUE_STATUS_PENDING = "pending";

export function loadCrewPayBridgePendingQueue() {
  return normalizeQueue(loadJson(STORAGE_KEYS.BRIDGE_PENDING_TIME_ENTRIES, []));
}

export function saveCrewPayBridgePendingQueue(queue = []) {
  return saveJson(STORAGE_KEYS.BRIDGE_PENDING_TIME_ENTRIES, normalizeQueue(queue));
}

export function enqueueCrewPayBridgePendingTimeEntries(payloads = [], options = {}) {
  const safePayloads = Array.isArray(payloads) ? payloads : [];
  const existingQueue = loadCrewPayBridgePendingQueue();
  const nextQueue = [...existingQueue];
  const queuedItems = [];
  const now = typeof options.now === "function" ? options.now : () => new Date().toISOString();
  const reason = normalizeReason(options.reason);

  for (const payload of safePayloads) {
    if (!isPlainObject(payload)) {
      continue;
    }

    const timestamp = now();
    const existingIndex = nextQueue.findIndex(
      (item) => queueIdentity(item.payload) === queueIdentity(payload),
    );

    if (existingIndex >= 0) {
      const updatedItem = {
        ...nextQueue[existingIndex],
        payload: { ...payload },
        status: QUEUE_STATUS_PENDING,
        lastError: reason || nextQueue[existingIndex].lastError || "",
        updatedAt: timestamp,
      };
      nextQueue[existingIndex] = updatedItem;
      queuedItems.push(updatedItem);
      continue;
    }

    const queuedItem = {
      id: buildQueueItemId(payload, timestamp),
      queuedAt: timestamp,
      updatedAt: timestamp,
      status: QUEUE_STATUS_PENDING,
      attempts: 0,
      lastError: reason,
      payload: { ...payload },
    };

    nextQueue.push(queuedItem);
    queuedItems.push(queuedItem);
  }

  saveCrewPayBridgePendingQueue(nextQueue);
  return queuedItems;
}

export function removeCrewPayBridgePendingQueueItems(ids = []) {
  const idSet = new Set((Array.isArray(ids) ? ids : []).map((id) => String(id)));

  if (idSet.size === 0) {
    return loadCrewPayBridgePendingQueue();
  }

  const nextQueue = loadCrewPayBridgePendingQueue().filter((item) => !idSet.has(item.id));
  saveCrewPayBridgePendingQueue(nextQueue);
  return nextQueue;
}

export function clearCrewPayBridgePendingQueue() {
  return saveCrewPayBridgePendingQueue([]);
}

function normalizeQueue(queue) {
  if (!Array.isArray(queue)) {
    return [];
  }

  return queue
    .map((item) => normalizeQueueItem(item))
    .filter(Boolean);
}

function normalizeQueueItem(item) {
  if (!isPlainObject(item) || !isPlainObject(item.payload)) {
    return null;
  }

  const queuedAt = normalizeString(item.queuedAt) || new Date().toISOString();

  return {
    id: normalizeString(item.id) || buildQueueItemId(item.payload, queuedAt),
    queuedAt,
    updatedAt: normalizeString(item.updatedAt) || queuedAt,
    status: normalizeString(item.status) || QUEUE_STATUS_PENDING,
    attempts: safeAttemptCount(item.attempts),
    lastError: normalizeString(item.lastError),
    payload: { ...item.payload },
  };
}

function buildQueueItemId(payload, timestamp) {
  return [
    "bridge",
    normalizeIdPart(payload.entryId || "entry"),
    normalizeIdPart(payload.payPeriodId || "period"),
    normalizeIdPart(timestamp),
  ].join("-");
}

function queueIdentity(payload) {
  if (!isPlainObject(payload)) {
    return "";
  }

  return [
    payload.action,
    payload.entryId,
    payload.payPeriodId,
    payload.workDate,
    payload.workerId,
  ]
    .map((value) => normalizeString(value))
    .join("|");
}

function safeAttemptCount(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

function normalizeReason(reason) {
  return normalizeString(reason);
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeIdPart(value) {
  return normalizeString(value).replace(/[^a-zA-Z0-9_-]+/g, "-") || "item";
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
