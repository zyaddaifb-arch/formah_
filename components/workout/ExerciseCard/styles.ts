import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 24,
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(225, 228, 249, 0.05)',
  },
  exerciseCardCondensed: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseTitleArea: {
    flex: 1,
  },
  notesContainer: {
    marginBottom: 16,
    gap: 8,
  },
  stickyNoteWrapper: {
    backgroundColor: '#FFD166',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  noteInput: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: Colors.onSurface,
    paddingVertical: 4,
  },
  stickyNoteInput: {
    color: '#1B1B1B',
  },
  noteDivider: {
    height: 1,
    backgroundColor: 'rgba(225, 228, 249, 0.1)',
    marginTop: 4,
  },
  stickyNoteDivider: {
    backgroundColor: 'rgba(27, 27, 27, 0.1)',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  setsList: {
    marginBottom: 16,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceContainerHighest,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225, 228, 249, 0.05)',
  },
  setRowDone: {
    backgroundColor: 'rgba(129, 236, 245, 0.05)',
  },
  setRowWarmUp: {
    backgroundColor: 'rgba(255, 209, 102, 0.05)',
  },
  setRowWithTimer: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  inputCell: {
    flex: 1.5,
    alignItems: 'center',
  },
  miniInput: {
    backgroundColor: 'rgba(225, 228, 249, 0.05)',
    borderRadius: 8,
    width: '80%',
    textAlign: 'center',
    paddingVertical: 8,
    color: Colors.onSurface,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
  },
  inputInvalid: {
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: 'rgba(255, 113, 108, 0.1)',
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(225, 228, 249, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBtnActive: {
    backgroundColor: Colors.primary,
  },
  checkBtnWarmUpActive: {
    backgroundColor: '#FFD166',
  },
  addButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addSetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: 'rgba(129, 236, 245, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
  lineTimerContainer: {
    height: 28,
    backgroundColor: 'rgba(9, 14, 28, 0.3)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineTimerBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    opacity: 0.6,
  },
  lineTimerText: {
    zIndex: 1,
    fontWeight: '700',
    fontSize: 11,
  },
  lineTimerDone: {
    backgroundColor: 'rgba(129, 236, 245, 0.1)',
  },
});
