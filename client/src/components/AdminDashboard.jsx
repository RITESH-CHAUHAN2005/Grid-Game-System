import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import './admin.css';
import { buildLeaderboard } from '../utils/leaderboard';
import { createTiles } from '../utils/tiles';

function formatClaimTime(timestamp) {
  if (!timestamp) {
    return '--:--';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
}

function toMillis(timestamp) {
  if (!timestamp) {
    return null;
  }

  if (typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis();
  }

  return timestamp;
}

export default function AdminDashboard({ tiles: fallbackTiles = [] }) {
  const [tab, setTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [firebaseTiles, setFirebaseTiles] = useState(fallbackTiles);
  const [firebaseUsers, setFirebaseUsers] = useState([]);

  useEffect(() => {
    const tilesQuery = query(collection(db, 'tiles'));
    const usersQuery = query(collection(db, 'users'));

    const unsubscribeTiles = onSnapshot(tilesQuery, (snapshot) => {
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
          claimedAt: toMillis(claimed.claimedAt)
        };
      });

      setFirebaseTiles(syncedTiles);
    });

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map((userDoc) => ({
        uid: userDoc.id,
        ...userDoc.data()
      }));

      setFirebaseUsers(users);
    });

    return () => {
      unsubscribeTiles();
      unsubscribeUsers();
    };
  }, [fallbackTiles]);

  const tiles = firebaseTiles.length ? firebaseTiles : fallbackTiles;
  const totalTiles = tiles.length;
  const claimedTiles = tiles.filter((tile) => Boolean(tile.ownerClientId)).length;
  const uniqueUsers = new Set(tiles.filter((tile) => tile.ownerClientId).map((tile) => tile.ownerClientId)).size;
  const leaderboard = useMemo(() => buildLeaderboard(tiles, null), [tiles]);

  const users = useMemo(() => {
    if (firebaseUsers.length) {
      return firebaseUsers.map((user) => {
        const userTiles = tiles.filter((tile) => tile.ownerClientId === user.uid);

        return {
          clientId: user.uid,
          name: user.displayName,
          email: user.email,
          color: user.color,
          tiles: userTiles.map((tile) => ({ id: tile.id, claimedAt: tile.claimedAt })),
          lastClaimed: userTiles.reduce((latest, tile) => {
            if (!tile.claimedAt) {
              return latest;
            }

            return !latest || tile.claimedAt > latest ? tile.claimedAt : latest;
          }, null),
          tilesCount: userTiles.length
        };
      });
    }

    const map = new Map();

    for (const tile of tiles) {
      if (!tile.ownerClientId) {
        continue;
      }

      const current = map.get(tile.ownerClientId) ?? {
        clientId: tile.ownerClientId,
        name: tile.ownerName,
        email: tile.ownerEmail,
        color: tile.ownerColor,
        tiles: [],
        lastClaimed: null
      };

      current.tiles.push({ id: tile.id, claimedAt: tile.claimedAt });
      if (tile.claimedAt && (!current.lastClaimed || tile.claimedAt > current.lastClaimed)) {
        current.lastClaimed = tile.claimedAt;
      }

      map.set(tile.ownerClientId, current);
    }

    return Array.from(map.values()).map((user) => ({ ...user, tilesCount: user.tiles.length }));
  }, [firebaseUsers, tiles]);

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    setSelectedUser(null);
  };

  const toggleUserDetails = (user) => {
    setSelectedUser((current) => (current && current.clientId === user.clientId ? null : user));
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{display:'flex',gap:8}}>
          <button className={`btn ${tab === 'overview' ? '' : 'ghost'}`} onClick={() => handleTabChange('overview')}>Overview</button>
          <button className={`btn ${tab === 'users' ? '' : 'ghost'}`} onClick={() => handleTabChange('users')}>Users</button>
        </div>
      </div>

      {tab === 'overview' && (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Online Users</h3>
              <div className="value">{uniqueUsers || 1}</div>
            </div>
            <div className="stat-card">
              <h3>Unique Users Seen</h3>
              <div className="value">{uniqueUsers}</div>
            </div>
            <div className="stat-card">
              <h3>Claimed Tiles</h3>
              <div className="value">{claimedTiles} / {totalTiles}</div>
            </div>
          </div>

          <div className="leaderboard">
            <h2 style={{marginTop:0}}>Leaderboard</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th style={{textAlign:'right'}}>Tiles</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length ? leaderboard.map((player) => (
                  <tr key={player.clientId}>
                    <td>{player.name || player.clientId}</td>
                    <td style={{textAlign:'right'}}>{player.tiles}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={2} style={{padding:12}}>No data yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'users' && (
        <div>
          <h2 style={{marginTop:0}}>Users</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Tiles</th>
                <th>Last Claimed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.length ? users.map((user) => (
                <tr key={user.clientId}>
                  <td>{user.name || user.clientId}</td>
                  <td className="small-muted">{user.email || '-'}</td>
                  <td style={{textAlign:'right'}}>{user.tilesCount}</td>
                  <td className="small-muted">{formatClaimTime(user.lastClaimed)}</td>
                  <td style={{textAlign:'right'}}>
                    <button className="btn ghost" onClick={() => toggleUserDetails(user)}>View</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{padding:12}}>No users yet</td></tr>
              )}
            </tbody>
          </table>

          {selectedUser && (
            <div style={{marginTop:12}} className="admin-card">
              <h3 style={{marginTop:0}}>User details — {selectedUser.name || selectedUser.clientId}</h3>
              <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:8}}>
                <div style={{width:12,height:12,borderRadius:6,background:selectedUser.color || '#cbd5e1'}} />
                <div className="small-muted">{selectedUser.email}</div>
                <div className="small-muted">{selectedUser.clientId}</div>
              </div>

              <div>
                <strong>Tiles ({selectedUser.tilesCount}):</strong>
                <div style={{marginTop:8,display:'flex',flexWrap:'wrap',gap:8}}>
                  {selectedUser.tiles.map((tile) => (
                    <div key={tile.id} style={{padding:'6px 8px',background:'#f8fafc',borderRadius:8,border:'1px solid #eef2f6'}}>{tile.id}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}