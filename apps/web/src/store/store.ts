import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools<{
    nickname: string;
    updateNickname: (nickname: string) => void;
  }>((set) => ({
    nickname: '',
    updateNickname: (newNickname) => set({ nickname: newNickname }),
  })),
);
