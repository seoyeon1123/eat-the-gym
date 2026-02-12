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

export const equipmentCategories: EquipmentCategory[] = [
  {
    id: 'chest',
    name: '가슴',
    equipment: [
      { id: 'chest-press', name: '체스트프레스', category: 'chest' },
      { id: 'bench-press', name: '벤치프레스', category: 'chest' },
      { id: 'incline-bench', name: '인클라인 벤치프레스', category: 'chest' },
      { id: 'cable-fly', name: '케이블 플라이', category: 'chest' },
      { id: 'pec-deck', name: '펙덱 플라이', category: 'chest' },
      { id: 'dip-machine', name: '딥스 머신', category: 'chest' },
    ],
  },
  {
    id: 'shoulder',
    name: '어깨',
    equipment: [
      { id: 'shoulder-press', name: '숄더프레스 머신', category: 'shoulder' },
      { id: 'db-shoulder-press', name: '덤벨 숄더프레스', category: 'shoulder' },
      { id: 'lateral-raise-machine', name: '레터럴 레이즈 머신', category: 'shoulder' },
      { id: 'rear-delt-fly', name: '리어 델트 플라이', category: 'shoulder' },
      { id: 'cable-lateral', name: '케이블 레터럴 레이즈', category: 'shoulder' },
      { id: 'face-pull', name: '페이스 풀 (케이블)', category: 'shoulder' },
    ],
  },
  {
    id: 'back',
    name: '등',
    equipment: [
      { id: 'lat-pulldown', name: '랫풀다운', category: 'back' },
      { id: 'seated-row', name: '시티드 로우', category: 'back' },
      { id: 'cable-row', name: '케이블 로우', category: 'back' },
      { id: 'pull-up-bar', name: '풀업 바', category: 'back' },
      { id: 't-bar-row', name: '티바 로우', category: 'back' },
      { id: 'back-extension', name: '백 익스텐션', category: 'back' },
    ],
  },
  {
    id: 'legs',
    name: '하체',
    equipment: [
      { id: 'leg-press', name: '레그 프레스', category: 'legs' },
      { id: 'squat-rack', name: '스쿼트 랙', category: 'legs' },
      { id: 'leg-extension', name: '레그 익스텐션', category: 'legs' },
      { id: 'leg-curl', name: '레그 컬', category: 'legs' },
      { id: 'hack-squat', name: '핵 스쿼트', category: 'legs' },
      { id: 'calf-raise', name: '카프 레이즈', category: 'legs' },
      { id: 'hip-thrust', name: '힙 쓰러스트', category: 'legs' },
    ],
  },
  {
    id: 'arms',
    name: '팔',
    equipment: [
      { id: 'bicep-curl-machine', name: '바이셉 컬 머신', category: 'arms' },
      { id: 'tricep-pushdown', name: '트라이셉 푸시다운 (케이블)', category: 'arms' },
      { id: 'preacher-curl', name: '프리처 컬', category: 'arms' },
      { id: 'cable-curl', name: '케이블 컬', category: 'arms' },
      { id: 'dumbbell-rack', name: '덤벨 랙', category: 'arms' },
      { id: 'ez-bar', name: 'EZ바', category: 'arms' },
    ],
  },
  {
    id: 'core',
    name: '코어',
    equipment: [
      { id: 'ab-crunch', name: '복근 크런치 머신', category: 'core' },
      { id: 'cable-crunch', name: '케이블 크런치', category: 'core' },
      { id: 'roman-chair', name: '로만 체어', category: 'core' },
      { id: 'ab-roller', name: 'AB 롤러', category: 'core' },
      { id: 'hanging-leg-raise', name: '행잉 레그 레이즈', category: 'core' },
    ],
  },
]

export const frequencyOptions = [
  { value: '2', label: '주 2회' },
  { value: '3', label: '주 3회' },
  { value: '4', label: '주 4회' },
  { value: '5', label: '주 5회' },
]

export const splitOptions = [
  { value: '2', label: '2분할' },
  { value: '3', label: '3분할' },
  { value: '5', label: '5분할' },
]

export const goalOptions = [
  { value: 'hypertrophy', label: '근비대' },
  { value: 'fat-loss', label: '체지방 감량' },
  { value: 'beginner', label: '초보자 루틴' },
  { value: 'maintenance', label: '유지 운동' },
]
