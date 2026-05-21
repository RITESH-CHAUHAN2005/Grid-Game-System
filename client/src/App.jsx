import { useEffect, useMemo, useRef, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import TopBar from "./components/TopBar";
import BoardPanel from "./components/BoardPanel";
import SidebarPanels from "./components/SidebarPanels";
import AdminPage from "./components/AdminPage";
import {
  BOARD,
  ONLINE_USERS,
  SPLASH_TEXT,
  STORAGE_KEY,
} from "./constants/grid";
import { buildLeaderboard } from "./utils/leaderboard";
import { loginAccount, registerAccount } from "./utils/auth";
import { createProfile } from "./utils/profile";
import { createTiles } from "./utils/tiles";
import {
  claimTileWithOwnershipRewrite,
  releaseTilesByOwner,
  subscribeToTiles,
} from "./utils/firebaseTiles";
import { isEmailValid, isHexColor } from "./utils/validators";

function App() {
  const initialProfile = createProfile();
  const [profile, setProfile] = useState(initialProfile);
  const [draftName, setDraftName] = useState(initialProfile.name);
  const [draftEmail, setDraftEmail] = useState(initialProfile.email);
  const [draftColor, setDraftColor] = useState(initialProfile.color);
  const hasProfile = Boolean(profile.name && profile.email);
  const [phase, setPhase] = useState(hasProfile ? "app" : "splash");
  const [splashText, setSplashText] = useState("");
  const [tiles, setTiles] = useState(() => createTiles());
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [zoom, setZoom] = useState(100);
  const [onboardingError, setOnboardingError] = useState("");
  const [authMode, setAuthMode] = useState("register");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [pendingClaimTileId, setPendingClaimTileId] = useState(null);
  const splashTimerRef = useRef(null);
  const typewriterTimerRef = useRef(null);
  const notificationTimersRef = useRef([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    return () => {
      notificationTimersRef.current.forEach((timerId) =>
        window.clearTimeout(timerId),
      );
      notificationTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTiles({
      onTiles: (syncedTiles) => {
        setTiles(syncedTiles);
      },
      onError: (error) => {
        console.error("Failed to sync tiles from Firestore", error);
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (hasProfile) {
      return undefined;
    }

    let index = 0;
    setSplashText("");

    const tick = () => {
      index += 1;
      setSplashText(SPLASH_TEXT.slice(0, index));

      if (index >= SPLASH_TEXT.length) {
        window.clearInterval(typewriterTimerRef.current);
        splashTimerRef.current = window.setTimeout(
          () => setPhase("onboarding"),
          600,
        );
      }
    };

    typewriterTimerRef.current = window.setInterval(tick, 70);
    tick();

    return () => {
      window.clearInterval(typewriterTimerRef.current);
      window.clearTimeout(splashTimerRef.current);
    };
  }, [hasProfile]);

  const claimedTiles = useMemo(
    () => tiles.filter((tile) => Boolean(tile.ownerClientId)).length,
    [tiles],
  );
  const myTiles = useMemo(
    () =>
      tiles.filter((tile) => tile.ownerClientId === profile.clientId).length,
    [tiles, profile.clientId],
  );
  const topPlayers = useMemo(() => buildLeaderboard(tiles, 5), [tiles]);
  const fullLeaderboard = useMemo(() => buildLeaderboard(tiles, null), [tiles]);
  const onlineUsers = ONLINE_USERS;
  const board = BOARD;

  function pushRecentNotification(message, ownerName = profile.name) {
    const notificationId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    setRecentNotifications((current) => [
      ...current,
      {
        id: notificationId,
        message,
        ownerName,
        createdAt: Date.now(),
      },
    ]);

    const timerId = window.setTimeout(() => {
      setRecentNotifications((current) =>
        current.filter((item) => item.id !== notificationId),
      );
      notificationTimersRef.current = notificationTimersRef.current.filter(
        (value) => value !== timerId,
      );
    }, 2000);

    notificationTimersRef.current.push(timerId);
  }

  async function sendWelcomeMail(nextProfile) {
    try {
      const response = await fetch("/send-welcome-mail.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nextProfile.name,
          email: nextProfile.email,
          color: nextProfile.color,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Welcome mail request failed with status ${response.status}`,
        );
      }
    } catch (error) {
      console.error("Welcome mail could not be sent", error);
    }
  }

  async function handleOnboardingSubmit(event) {
    event.preventDefault();

    const nextName = draftName.trim().slice(0, 20);
    const nextEmail = draftEmail.trim().toLowerCase();
    const nextColor = draftColor.trim().toLowerCase();

    if (!nextName) {
      setOnboardingError("Please enter a name first.");
      return;
    }

    if (!isEmailValid(nextEmail)) {
      setOnboardingError("Please enter a valid email address.");
      return;
    }

    if (authMode === "register" && !isHexColor(nextColor)) {
      setOnboardingError("Please select a valid color.");
      return;
    }

    setIsAuthSubmitting(true);

    try {
      const nextProfile =
        authMode === "register"
          ? await registerAccount({
              email: nextEmail,
              passwordName: nextName,
              color: nextColor,
            })
          : await loginAccount({
              email: nextEmail,
              passwordName: nextName,
            });

      setProfile(nextProfile);
      setDraftName(nextProfile.name);
      setDraftEmail(nextProfile.email);
      setDraftColor(nextProfile.color);
      setPhase("app");
      if (authMode === "register") {
        void sendWelcomeMail(nextProfile);
      }
      pushRecentNotification(
        authMode === "register"
          ? "account created successfully"
          : "login successful",
        nextProfile.name,
      );
    } catch (error) {
      console.error("Onboarding auth failed", error);

      const code = error?.code ?? "";

      if (code === "auth/email-already-in-use") {
        setOnboardingError(
          "An account already exists for this email. Please use the login option.",
        );
      } else if (code === "auth/user-not-found") {
        setOnboardingError(
          "No account found for this email. Please register first.",
        );
      } else if (code === "auth/wrong-password") {
        setOnboardingError(
          "Wrong password. Please enter the correct password in the name field.",
        );
      } else if (code === "auth/weak-password") {
        setOnboardingError("Please use a stronger password.");
      } else if (code === "permission-denied") {
        setOnboardingError(
          "Firebase rules are blocking the write. Please update your Firestore rules.",
        );
      } else if (code === "failed-precondition") {
        setOnboardingError(
          "Firestore is not initialized. Please enable Firestore in the Firebase Console.",
        );
      } else if (code === "unavailable") {
        setOnboardingError(
          "Network or Firestore service is unavailable. Please try again later.",
        );
      } else if (code === "auth/invalid-email") {
        setOnboardingError("Please enter a valid email address.");
      } else {
        setOnboardingError(
          code.startsWith("auth/")
            ? error.message
            : "Authentication failed. Please try again later.",
        );
      }
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleClaim(tileId) {
    setPendingClaimTileId(tileId);

    try {
      const claimResult = await claimTileWithOwnershipRewrite(tileId, profile);

      if (
        claimResult.previousOwnerClientId &&
        claimResult.previousOwnerClientId !== profile.clientId
      ) {
        const previousOwnerLabel =
          claimResult.previousOwnerName || "another player";
        pushRecentNotification(
          `captured tile ${tileId} from ${previousOwnerLabel}`,
        );
      } else {
        pushRecentNotification(`claimed tile ${tileId}`);
      }
    } catch (error) {
      console.error(`Failed to claim tile ${tileId}`, error);
      pushRecentNotification(`failed to claim tile ${tileId}`);
    } finally {
      setPendingClaimTileId((current) => (current === tileId ? null : current));
    }
  }

  function handleClaimRandomTile() {
    const unclaimed = tiles.filter((tile) => !tile.ownerClientId);
    if (!unclaimed.length) {
      pushRecentNotification("all tiles are already claimed");
      return;
    }

    const randomTile = unclaimed[Math.floor(Math.random() * unclaimed.length)];
    void handleClaim(randomTile.id);
  }

  async function handleReleaseMyTiles() {
    try {
      const releasedCount = await releaseTilesByOwner(profile.clientId);

      if (!releasedCount) {
        pushRecentNotification("You do not own any tiles yet");
        return;
      }

      pushRecentNotification(
        `released ${releasedCount} tile${releasedCount > 1 ? "s" : ""}`,
      );
    } catch (error) {
      console.error("Failed to release tiles", error);
      pushRecentNotification("failed to release your tiles");
    }
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(createProfile());
    // show onboarding/login after logout
    setPhase("onboarding");
    setDraftName("");
    setDraftEmail("");
    setDraftColor(createProfile().color);
    setAuthMode("register");
    pushRecentNotification("logged out successfully");
  }

  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin")
  ) {
    return <AdminPage tiles={tiles} />;
  }

  if (phase === "splash") {
    return (
      <SplashScreen
        splashText={splashText}
        onStart={() => setPhase("onboarding")}
      />
    );
  }

  if (phase === "onboarding") {
    return (
      <OnboardingScreen
        draftName={draftName}
        draftEmail={draftEmail}
        draftColor={draftColor}
        setDraftName={(value) => {
          setDraftName(value);
          setOnboardingError("");
        }}
        setDraftEmail={(value) => {
          setDraftEmail(value);
          setOnboardingError("");
        }}
        setDraftColor={(value) => {
          setDraftColor(value);
          setOnboardingError("");
        }}
        onSubmit={handleOnboardingSubmit}
        onboardingError={onboardingError}
        authMode={authMode}
        setAuthMode={(mode) => {
          setAuthMode(mode);
          setOnboardingError("");
        }}
        isAuthSubmitting={isAuthSubmitting}
        onBack={() => setPhase("splash")}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <main className="app">
        <TopBar
          profile={profile}
          zoom={zoom}
          setZoom={setZoom}
          onLogout={handleLogout}
        />

        <section className="workspace reveal fade-up delay-2">
          <BoardPanel
            board={board}
            tiles={tiles}
            zoom={zoom}
            profile={profile}
            handleClaim={handleClaim}
            pendingClaimTileId={pendingClaimTileId}
          />

          <SidebarPanels
            onlineUsers={onlineUsers}
            claimedTiles={claimedTiles}
            myTiles={myTiles}
            board={board}
            topPlayers={topPlayers}
            fullLeaderboard={fullLeaderboard}
            recentNotifications={recentNotifications}
            handleClaimRandomTile={handleClaimRandomTile}
            handleReleaseMyTiles={handleReleaseMyTiles}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
