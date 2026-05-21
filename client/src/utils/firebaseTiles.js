import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { createTiles } from './tiles';

const TILES_COLLECTION = 'tiles';

function normalizeClaimedAt(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (typeof value === 'number') {
    return value;
  }

  return null;
}

export function subscribeToTiles({ onTiles, onError }) {
  const tilesRef = collection(db, TILES_COLLECTION);

  return onSnapshot(
    tilesRef,
    (snapshot) => {
      const claimedTilesById = new Map();

      snapshot.forEach((tileDoc) => {
        claimedTilesById.set(tileDoc.id, tileDoc.data());
      });

      const syncedTiles = createTiles().map((tile) => {
        const claimed = claimedTilesById.get(tile.id);

        if (!claimed) {
          return tile;
        }

        return {
          ...tile,
          ownerClientId: claimed.ownerClientId ?? null,
          ownerName: claimed.ownerName ?? null,
          ownerEmail: claimed.ownerEmail ?? null,
          ownerColor: claimed.ownerColor ?? null,
          claimedAt: normalizeClaimedAt(claimed.claimedAt)
        };
      });

      onTiles(syncedTiles);
    },
    onError
  );
}

export async function claimTileWithOwnershipRewrite(tileId, profile) {
  const tileRef = doc(db, TILES_COLLECTION, tileId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tileRef);
    const previous = snapshot.exists() ? snapshot.data() : null;

    transaction.set(
      tileRef,
      {
        id: tileId,
        x: Number(tileId.split(':')[0]),
        y: Number(tileId.split(':')[1]),
        ownerClientId: profile.clientId,
        ownerName: profile.name,
        ownerEmail: profile.email,
        ownerColor: profile.color,
        claimedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    return {
      previousOwnerClientId: previous?.ownerClientId ?? null,
      previousOwnerName: previous?.ownerName ?? null
    };
  });
}

export async function releaseTilesByOwner(ownerClientId) {
  const tilesRef = collection(db, TILES_COLLECTION);
  const ownedTilesQuery = query(tilesRef, where('ownerClientId', '==', ownerClientId));
  const ownedTiles = await getDocs(ownedTilesQuery);

  if (!ownedTiles.size) {
    return 0;
  }

  const batch = writeBatch(db);

  ownedTiles.forEach((tileDoc) => {
    batch.set(
      tileDoc.ref,
      {
        ownerClientId: null,
        ownerName: null,
        ownerEmail: null,
        ownerColor: null,
        claimedAt: null,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  });

  await batch.commit();
  return ownedTiles.size;
}