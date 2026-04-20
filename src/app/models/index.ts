export interface Ninja {
  id?: string;
  username: string;
  rank: 'genin' | 'chunin' | 'jonin';
  xp: number;
  level: number;
  acceptedMissions?: string[];
  completedMissions?: string[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  rank: 'D' | 'C' | 'B' | 'A' | 'S';
  status: 'DISPONIBLE' | 'ACEPTADA' | 'COMPLETADA' | 'CANCELADA';
  reward: number;
  assignedTo?: string;
}

export interface AuthResponse {
  token: string;
  ninja: Ninja;
}

export interface Stats {
  totalXp: number;
  level: number;
  rank: string;
  completedMissions: number;
  acceptedMissions: number;
}

export interface MissionReport {
  reportText: string;
  evidenceImageUrl?: string;
}
