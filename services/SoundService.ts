import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const SOUND_ASSETS = {
  add_set: require('../assets/sounds/add_set.mp3'),
  remove_set: require('../assets/sounds/remove_set.mp3'),
  select_exercise: require('../assets/sounds/select_exercise.mp3'),
  done_set: require('../assets/sounds/done_set.mp3'),
} as const;

class SoundService {
  private sounds: Record<string, ReturnType<typeof createAudioPlayer>> = {};
  private isLoading: boolean = false;

  async init() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      for (const [key, asset] of Object.entries(SOUND_ASSETS)) {
        this.sounds[key] = createAudioPlayer(asset);
      }
    } catch (error) {
      console.error('Failed to load sounds:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async playSound(name: keyof typeof SOUND_ASSETS, hapticType?: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType) {
    try {
      const sound = this.sounds[name];
      if (sound) {
        await sound.seekTo(0);
        sound.play();
      }
      if (hapticType) {
        if (Object.values(Haptics.NotificationFeedbackType).includes(hapticType as any)) {
          await Haptics.notificationAsync(hapticType as Haptics.NotificationFeedbackType);
        } else {
          await Haptics.impactAsync(hapticType as Haptics.ImpactFeedbackStyle);
        }
      }
    } catch (error) {
       console.warn(`Could not play sound ${name}:`, error);
    }
  }

  async playAddSet() {
    await this.playSound('add_set', Haptics.ImpactFeedbackStyle.Medium);
  }

  async playRemoveSet() {
    await this.playSound('remove_set', Haptics.ImpactFeedbackStyle.Light);
  }

  async playSelectExercise() {
    await this.playSound('select_exercise', Haptics.ImpactFeedbackStyle.Light);
  }

  async playDoneSet() {
    await this.playSound('done_set', Haptics.NotificationFeedbackType.Success);
  }

  // Cleanup method if needed
  async unloadAll() {
    for (const sound of Object.values(this.sounds)) {
      sound.remove();
    }
    this.sounds = {};
  }
}

export const soundService = new SoundService();
