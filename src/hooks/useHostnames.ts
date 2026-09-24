import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HostnameRecord } from '../types';
import { useAuth } from '../context/AuthContext';

const DEFAULT_SEED_HOSTNAMES: HostnameRecord[] = [
  {
    id: 'host-1',
    name: 'fs-gateway',
    domain: '.ddns.net',
    fullHostname: 'fs-gateway.ddns.net',
    targetIp: '198.51.100.42',
    targetIpv6: '2001:db8:85a3::8a2e:370:7334',
    recordType: 'DUAL',
    lastUpdated: '10 minutes ago',
    status: 'Active',
    port: 80,
  },
  {
    id: 'host-2',
    name: 'cam-yard',
    domain: '.freedynamicdns.net',
    fullHostname: 'cam-yard.freedynamicdns.net',
    targetIp: '198.51.100.42',
    recordType: 'A',
    lastUpdated: '2 hours ago',
    status: 'Active',
    port: 8000,
  },
  {
    id: 'host-3',
    name: 'ipv6-mesh',
    domain: '.zapto.org',
    fullHostname: 'ipv6-mesh.zapto.org',
    targetIp: '',
    targetIpv6: '2607:f8b0:4005:805::200e',
    recordType: 'AAAA',
    lastUpdated: '5 minutes ago',
    status: 'Active',
    port: 443,
  },
];

export function useHostnames(currentIp: string) {
  const { user } = useAuth();
  const [hostnames, setHostnames] = useState<HostnameRecord[]>(DEFAULT_SEED_HOSTNAMES);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const isSeedingRef = useRef<boolean>(false);

  // Firestore real-time listener for current user's hostnames
  useEffect(() => {
    let isCancelled = false;

    if (!user) {
      // If not authenticated, load from localStorage if available
      try {
        const local = localStorage.getItem('noip_hostnames');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTimeout(() => {
              if (!isCancelled) {
                setHostnames(parsed);
              }
            }, 0);
          }
        }
      } catch (e) {
        console.warn('Could not read local hostnames:', e);
      }
      setTimeout(() => {
        if (!isCancelled) {
          setLoading(false);
          setIsCloudSynced(false);
        }
      }, 0);
      return () => {
        isCancelled = true;
      };
    }

    const hostnamesRef = collection(db, 'users', user.uid, 'hostnames');
    const q = query(hostnamesRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (isCancelled) return;

        if (snapshot.empty) {
          // First-time user: seed initial demo hostnames into Firestore in background without synchronous recursion
          if (!isSeedingRef.current) {
            isSeedingRef.current = true;
            (async () => {
              try {
                for (const item of DEFAULT_SEED_HOSTNAMES) {
                  const docRef = doc(db, 'users', user.uid, 'hostnames', item.id);
                  await setDoc(docRef, {
                    ...item,
                    targetIp: currentIp || item.targetIp,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  });
                }
              } catch (seedErr) {
                console.warn('Could not seed initial hostnames:', seedErr);
              } finally {
                isSeedingRef.current = false;
              }
            })();
          }

          setTimeout(() => {
            if (!isCancelled) {
              setHostnames(DEFAULT_SEED_HOSTNAMES);
              setLoading(false);
              setIsCloudSynced(true);
              setSyncError(null);
            }
          }, 0);
          return;
        }

        const list: HostnameRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.name || '',
            domain: data.domain || '.ddns.net',
            fullHostname: data.fullHostname || `${data.name}${data.domain}`,
            targetIp: data.targetIp || '',
            targetIpv6: data.targetIpv6 || '',
            recordType: data.recordType || (data.targetIpv6 ? (data.targetIp ? 'DUAL' : 'AAAA') : 'A'),
            lastUpdated: data.lastUpdated || 'Just now',
            status: data.status || 'Active',
            port: data.port || 80,
          });
        });

        setTimeout(() => {
          if (!isCancelled) {
            setHostnames(list);
            setLoading(false);
            setIsCloudSynced(true);
            setSyncError(null);
          }
        }, 0);
      },
      (err) => {
        if (isCancelled) return;
        console.warn('Firestore onSnapshot notice:', err.message);
        setTimeout(() => {
          if (!isCancelled) {
            setSyncError(err.message);
            setIsCloudSynced(false);
            setLoading(false);
          }
        }, 0);
      }
    );

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [user, currentIp]);

  // Add Hostname to Firestore
  const addHostname = useCallback(
    async (record: HostnameRecord) => {
      // Optimistic local update
      setHostnames((prev) => [record, ...prev]);

      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'hostnames', record.id);
          await setDoc(docRef, {
            ...record,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setIsCloudSynced(true);
        } catch (err: any) {
          console.error('Error saving hostname to Firestore:', err);
          setSyncError(err.message);
        }
      } else {
        localStorage.setItem('noip_hostnames', JSON.stringify([record, ...hostnames]));
      }
    },
    [user, hostnames]
  );

  // Delete Hostname from Firestore
  const deleteHostname = useCallback(
    async (id: string) => {
      // Optimistic local update
      setHostnames((prev) => prev.filter((h) => h.id !== id));

      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'hostnames', id);
          await deleteDoc(docRef);
        } catch (err: any) {
          console.error('Error deleting hostname from Firestore:', err);
          setSyncError(err.message);
        }
      } else {
        const remaining = hostnames.filter((h) => h.id !== id);
        localStorage.setItem('noip_hostnames', JSON.stringify(remaining));
      }
    },
    [user, hostnames]
  );

  // Refresh Hostname target IP
  const refreshHostname = useCallback(
    async (id: string) => {
      const nowStr = 'Just now';
      setHostnames((prev) =>
        prev.map((h) => (h.id === id ? { ...h, lastUpdated: nowStr, targetIp: currentIp } : h))
      );

      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'hostnames', id);
          await updateDoc(docRef, {
            targetIp: currentIp,
            lastUpdated: nowStr,
            updatedAt: serverTimestamp(),
          });
        } catch (err: any) {
          console.error('Error updating hostname in Firestore:', err);
        }
      }
    },
    [user, currentIp]
  );

  // Bulk update all hostnames to new IP (e.g. from DUC)
  const updateAllHostnamesIp = useCallback(
    async (newIp: string) => {
      const nowStr = 'Just now (via DUC)';
      setHostnames((prev) =>
        prev.map((h) => ({
          ...h,
          targetIp: newIp,
          lastUpdated: nowStr,
        }))
      );

      if (user) {
        try {
          for (const h of hostnames) {
            const docRef = doc(db, 'users', user.uid, 'hostnames', h.id);
            await updateDoc(docRef, {
              targetIp: newIp,
              lastUpdated: nowStr,
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err: any) {
          console.error('Error bulk updating hostnames:', err);
        }
      }
    },
    [user, hostnames]
  );

  // Refresh all hostnames target IP and timestamp
  const refreshAllHostnames = useCallback(
    async () => {
      const nowStr = 'Just now';
      setHostnames((prev) =>
        prev.map((h) => ({ ...h, lastUpdated: nowStr, targetIp: currentIp || h.targetIp }))
      );

      if (user) {
        try {
          for (const h of hostnames) {
            const docRef = doc(db, 'users', user.uid, 'hostnames', h.id);
            await updateDoc(docRef, {
              lastUpdated: nowStr,
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err: any) {
          console.error('Error refreshing all hostnames in Firestore:', err);
        }
      }
    },
    [user, hostnames, currentIp]
  );

  // Update specific fields of a hostname record (e.g. adding AAAA IPv6)
  const updateHostname = useCallback(
    async (id: string, updates: Partial<HostnameRecord>) => {
      const nowStr = 'Just now';
      setHostnames((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...updates, lastUpdated: nowStr } : h))
      );

      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'hostnames', id);
          await updateDoc(docRef, {
            ...updates,
            lastUpdated: nowStr,
            updatedAt: serverTimestamp(),
          });
        } catch (err: any) {
          console.error('Error updating hostname record:', err);
        }
      } else {
        setHostnames((currentList) => {
          const updated = currentList.map((h) =>
            h.id === id ? { ...h, ...updates, lastUpdated: nowStr } : h
          );
          try {
            localStorage.setItem('noip_hostnames', JSON.stringify(updated));
          } catch (e) {
            console.warn('Could not persist updated hostname to localStorage:', e);
          }
          return updated;
        });
      }
    },
    [user]
  );

  return {
    hostnames,
    loading,
    isCloudSynced,
    syncError,
    addHostname,
    deleteHostname,
    updateHostname,
    refreshHostname,
    refreshAllHostnames,
    updateAllHostnamesIp,
  };
}
