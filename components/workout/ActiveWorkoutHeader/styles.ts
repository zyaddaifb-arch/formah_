import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  restTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(129, 236, 255, 0.1)',
    minWidth: 44,
    justifyContent: 'center',
  },
  timerProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    opacity: 0.9,
  },
  timerText: {
    letterSpacing: -1,
  },
  finishBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  minimizeBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
