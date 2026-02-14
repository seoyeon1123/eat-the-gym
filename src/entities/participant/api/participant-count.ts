import { doc, getDoc, setDoc, updateDoc, increment, enableNetwork } from "firebase/firestore";
import { db } from "@/shared/config/firebase";

async function ensureOnline(): Promise<void> {
  await enableNetwork(db);
}

const STATS_COLLECTION = "stats";
const PARTICIPANT_DOC = "participant";

/**
 * Firestore stats/participant 문서의 count 값을 조회합니다.
 * 문서가 없으면 0을 반환합니다.
 */
export async function getParticipantCount(): Promise<number> {
  console.log("[Firebase Firestore] 참여자 수 조회 시도...");
  await ensureOnline();
  const ref = doc(db, STATS_COLLECTION, PARTICIPANT_DOC);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    console.log("[Firebase Firestore] 참여자 수 조회: 문서 없음 → 0");
    return 0;
  }
  const data = snap.data();
  const count = typeof data?.count === "number" ? data.count : 0;
  console.log("[Firebase Firestore] 참여자 수 조회 성공", { count });
  return count;
}

/**
 * 참여자 수를 1 증가시킵니다. (시작하기 클릭 시 호출)
 * 문서가 없으면 count: 1로 생성합니다.
 */
const TIMEOUT_MS = 6000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore 타임아웃")), ms)
    ),
  ]);
}

export async function incrementParticipantCount(): Promise<void> {
  console.log("[Firebase Firestore] 참여자 수 증가 시도...");
  try {
    await ensureOnline();
    console.log("[Firebase Firestore] 참여자 수 증가: 네트워크 확인됨");
    const ref = doc(db, STATS_COLLECTION, PARTICIPANT_DOC);
    console.log("[Firebase Firestore] 참여자 수 증가: getDoc 호출 중...");
    const snap = await withTimeout(getDoc(ref), TIMEOUT_MS);
    console.log("[Firebase Firestore] 참여자 수 증가: getDoc 완료");
    if (!snap.exists()) {
      await withTimeout(setDoc(ref, { count: 1 }), TIMEOUT_MS);
      console.log("[Firebase Firestore] 참여자 수 +1 (새 문서 생성)");
      return;
    }
    await withTimeout(updateDoc(ref, { count: increment(1) }), TIMEOUT_MS);
    console.log("[Firebase Firestore] 참여자 수 +1 성공");
  } catch (e) {
    if (e instanceof Error && e.message === "Firestore 타임아웃") {
      console.warn("[Firebase Firestore] 참여자 수 증가: 응답 없음 (타임아웃). Firestore 규칙·DB 확인 필요.");
    } else {
      console.error("[Firebase Firestore] 참여자 수 증가 실패", e);
    }
    throw e;
  }
}
