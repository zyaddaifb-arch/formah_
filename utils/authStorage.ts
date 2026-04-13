import AsyncStorage from '@react-native-async-storage/async-storage';

export const authStorage = {
  getItem: async (key: string) => {
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};
