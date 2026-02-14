import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeFirestore, enableNetwork } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyAKHPcMvXVXaEvdaFwUB3LXQBUuK3WJpyM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "eat-the-gym.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "eat-the-gym",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "eat-the-gym.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "801453332077",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:801453332077:web:7b9d685f8b948e65669164",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-LQCDCH3CC5",
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
// getDoc 등이 응답 없이 멈출 때 long polling으로 우회 (일부 환경에서 WebChannel 미동작)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// 클라이언트가 오프라인으로 인식하는 문제 방지 (네트워크 사용 명시)
enableNetwork(db)
  .then(() => console.log("[Firebase] 연결됨 (네트워크 사용)", { projectId: firebaseConfig.projectId }))
  .catch((e) => console.warn("[Firebase] enableNetwork 실패 (오프라인일 수 있음)", e));
