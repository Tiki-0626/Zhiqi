
export type MorphState = 'SCATTERED' | 'ASSEMBLED';

export interface Wish {
  id: string;
  text: string;
  author: string;
  sentiment: 'luxurious' | 'warm' | 'hopeful';
}

export interface TreeConfig {
  bloomIntensity: number;
  rotationSpeed: number;
  emeraldTone: string;
  goldTone: string;
}
