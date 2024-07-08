import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools((set) => ({
    nickname: '',
    updateNickname: (newNickname) => set({ nickname: newNickname }),
  })),
);
