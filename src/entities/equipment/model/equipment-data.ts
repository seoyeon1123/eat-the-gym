export interface Equipment {
  id: string
  name: string
  category: string
}

export interface EquipmentCategory {
  id: string
  name: string
  equipment: Equipment[]
}

// 운동 서브 카테고리 타입 (모든 부위 공통)
export type EquipmentSubCategory = 'machine' | 'barbell' | 'dumbbell'

export interface SubCategoryEquipment {
  id: string
  name: string
  category: string
  subCategory: EquipmentSubCategory
}

// 모든 부위 운동 데이터 (서브 카테고리별로 분류)
export const exercisesByCategory: Record<string, Record<EquipmentSubCategory, SubCategoryEquipment[]>> = {
  chest: {
    machine: [
      { id: 'chest-press', name: '체스트프레스', category: 'chest', subCategory: 'machine' },
      { id: 'pec-deck', name: '펙덱 플라이', category: 'chest', subCategory: 'machine' },
      { id: 'dip-machine', name: '딥스 머신', category: 'chest', subCategory: 'machine' },
      { id: 'cable-fly', name: '케이블 플라이', category: 'chest', subCategory: 'machine' },
    ],
    barbell: [
      { id: 'bench-press', name: '벤치프레스', category: 'chest', subCategory: 'barbell' },
      { id: 'incline-bench', name: '인클라인 벤치프레스', category: 'chest', subCategory: 'barbell' },
      { id: 'decline-bench', name: '디클라인 벤치프레스', category: 'chest', subCategory: 'barbell' },
    ],
    dumbbell: [
      { id: 'db-bench-press', name: '덤벨 벤치프레스', category: 'chest', subCategory: 'dumbbell' },
      { id: 'db-incline-press', name: '덤벨 인클라인 프레스', category: 'chest', subCategory: 'dumbbell' },
      { id: 'db-fly', name: '덤벨 플라이', category: 'chest', subCategory: 'dumbbell' },
      { id: 'db-pullover', name: '덤벨 풀오버', category: 'chest', subCategory: 'dumbbell' },
    ],
  },
  shoulder: {
    machine: [
      { id: 'shoulder-press', name: '숄더프레스 머신', category: 'shoulder', subCategory: 'machine' },
      { id: 'lateral-raise-machine', name: '레터럴 레이즈 머신', category: 'shoulder', subCategory: 'machine' },
      { id: 'cable-lateral', name: '케이블 레터럴 레이즈', category: 'shoulder', subCategory: 'machine' },
      { id: 'face-pull', name: '페이스 풀 (케이블)', category: 'shoulder', subCategory: 'machine' },
    ],
    barbell: [
      { id: 'bb-shoulder-press', name: '바벨 숄더프레스', category: 'shoulder', subCategory: 'barbell' },
      { id: 'bb-upright-row', name: '바벨 업라이트 로우', category: 'shoulder', subCategory: 'barbell' },
      { id: 'bb-front-raise', name: '바벨 프론트 레이즈', category: 'shoulder', subCategory: 'barbell' },
    ],
    dumbbell: [
      { id: 'db-shoulder-press', name: '덤벨 숄더프레스', category: 'shoulder', subCategory: 'dumbbell' },
      { id: 'db-lateral-raise', name: '덤벨 레터럴 레이즈', category: 'shoulder', subCategory: 'dumbbell' },
      { id: 'db-rear-delt-fly', name: '덤벨 리어 델트 플라이', category: 'shoulder', subCategory: 'dumbbell' },
      { id: 'db-front-raise', name: '덤벨 프론트 레이즈', category: 'shoulder', subCategory: 'dumbbell' },
    ],
  },
  back: {
    machine: [
      { id: 'lat-pulldown', name: '랫풀다운', category: 'back', subCategory: 'machine' },
      { id: 'seated-row', name: '시티드 로우', category: 'back', subCategory: 'machine' },
      { id: 'cable-row', name: '케이블 로우', category: 'back', subCategory: 'machine' },
      { id: 'back-extension', name: '백 익스텐션', category: 'back', subCategory: 'machine' },
    ],
    barbell: [
      { id: 'bb-bent-over-row', name: '바벨 벤트오버 로우', category: 'back', subCategory: 'barbell' },
      { id: 'bb-deadlift', name: '바벨 데드리프트', category: 'back', subCategory: 'barbell' },
      { id: 't-bar-row', name: '티바 로우', category: 'back', subCategory: 'barbell' },
    ],
    dumbbell: [
      { id: 'db-row', name: '덤벨 로우', category: 'back', subCategory: 'dumbbell' },
      { id: 'db-pullover-back', name: '덤벨 풀오버', category: 'back', subCategory: 'dumbbell' },
      { id: 'db-shrug', name: '덤벨 슈러그', category: 'back', subCategory: 'dumbbell' },
      { id: 'pull-up-bar', name: '풀업 바', category: 'back', subCategory: 'dumbbell' },
    ],
  },
  legs: {
    machine: [
      { id: 'leg-press', name: '레그 프레스', category: 'legs', subCategory: 'machine' },
      { id: 'leg-extension', name: '레그 익스텐션', category: 'legs', subCategory: 'machine' },
      { id: 'leg-curl', name: '레그 컬', category: 'legs', subCategory: 'machine' },
      { id: 'hack-squat', name: '핵 스쿼트', category: 'legs', subCategory: 'machine' },
      { id: 'calf-raise', name: '카프 레이즈', category: 'legs', subCategory: 'machine' },
    ],
    barbell: [
      { id: 'squat-rack', name: '바벨 스쿼트', category: 'legs', subCategory: 'barbell' },
      { id: 'bb-romanian-deadlift', name: '바벨 루마니안 데드리프트', category: 'legs', subCategory: 'barbell' },
      { id: 'bb-lunge', name: '바벨 런지', category: 'legs', subCategory: 'barbell' },
    ],
    dumbbell: [
      { id: 'db-squat', name: '덤벨 스쿼트', category: 'legs', subCategory: 'dumbbell' },
      { id: 'db-lunge', name: '덤벨 런지', category: 'legs', subCategory: 'dumbbell' },
      { id: 'db-romanian-deadlift', name: '덤벨 루마니안 데드리프트', category: 'legs', subCategory: 'dumbbell' },
      { id: 'hip-thrust', name: '힙 쓰러스트', category: 'legs', subCategory: 'dumbbell' },
    ],
  },
  arms: {
    machine: [
      { id: 'bicep-curl-machine', name: '바이셉 컬 머신', category: 'arms', subCategory: 'machine' },
      { id: 'tricep-pushdown', name: '트라이셉 푸시다운 (케이블)', category: 'arms', subCategory: 'machine' },
      { id: 'cable-curl', name: '케이블 컬', category: 'arms', subCategory: 'machine' },
    ],
    barbell: [
      { id: 'bb-bicep-curl', name: '바벨 바이셉 컬', category: 'arms', subCategory: 'barbell' },
      { id: 'ez-bar', name: 'EZ바 컬', category: 'arms', subCategory: 'barbell' },
      { id: 'bb-tricep-extension', name: '바벨 트라이셉 익스텐션', category: 'arms', subCategory: 'barbell' },
    ],
    dumbbell: [
      { id: 'db-bicep-curl', name: '덤벨 바이셉 컬', category: 'arms', subCategory: 'dumbbell' },
      { id: 'db-tricep-extension', name: '덤벨 트라이셉 익스텐션', category: 'arms', subCategory: 'dumbbell' },
      { id: 'preacher-curl', name: '프리처 컬', category: 'arms', subCategory: 'dumbbell' },
    ],
  },
}

// 하위 호환성을 위한 별칭 (기존 코드와의 호환)
export type ChestSubCategory = EquipmentSubCategory
export type ChestEquipment = SubCategoryEquipment
export const chestExercises = exercisesByCategory.chest

export const equipmentCategories: EquipmentCategory[] = [
  {
    id: 'chest',
    name: '가슴',
    equipment: [], // 모든 부위는 서브 카테고리로 처리하므로 빈 배열
  },
  {
    id: 'shoulder',
    name: '어깨',
    equipment: [], // 서브 카테고리로 처리
  },
  {
    id: 'back',
    name: '등',
    equipment: [], // 서브 카테고리로 처리
  },
  {
    id: 'legs',
    name: '하체',
    equipment: [], // 서브 카테고리로 처리
  },
  {
    id: 'arms',
    name: '팔',
    equipment: [], // 서브 카테고리로 처리
  },
]

export const frequencyOptions = [
  { value: '1', label: '주 1회' },
  { value: '2', label: '주 2회' },
  { value: '3', label: '주 3회' },
  { value: '4', label: '주 4회' },
  { value: '5', label: '주 5회' },
  { value: '6', label: '주 6회' },
  { value: '7', label: '주 7회' },
]

export const splitOptions = [
  { value: '0', label: '무분할' },
  { value: '2', label: '2분할' },
  { value: '3', label: '3분할' },
  { value: '4', label: '4분할' },
  { value: '5', label: '5분할' },
]

export const focusOptions = [
  { value: 'lower', label: '하체' },
  { value: 'upper', label: '상체' },
  { value: 'glutes', label: '엉덩이' },
]

// 하위 호환성을 위한 goalOptions (기존 코드와의 호환)
export const goalOptions = [
  { value: 'hypertrophy', label: '근비대' },
  { value: 'fat-loss', label: '체지방 감량' },
  { value: 'beginner', label: '초보자 루틴' },
  { value: 'maintenance', label: '유지 운동' },
]
