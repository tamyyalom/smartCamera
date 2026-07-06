import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {CropMode} from '../services/media/imageEditing';

interface PhotoEditorToolbarProps {
  cropMode: CropMode;
  hasChanges: boolean;
  isProcessing: boolean;
  isSaving: boolean;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onCropModeChange: (mode: CropMode) => void;
  onReset: () => void;
  onSave: () => void;
}

const CROP_OPTIONS: {id: CropMode; label: string}[] = [
  {id: 'none', label: 'ללא חיתוך'},
  {id: 'center', label: 'חיתוך מרכז'},
  {id: 'square', label: 'ריבוע מרכזי'},
];

export function PhotoEditorToolbar({
  cropMode,
  hasChanges,
  isProcessing,
  isSaving,
  onRotateLeft,
  onRotateRight,
  onCropModeChange,
  onReset,
  onSave,
}: PhotoEditorToolbarProps) {
  const busy = isProcessing || isSaving;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <ToolButton label="↺ 90°" onPress={onRotateLeft} disabled={busy} />
        <ToolButton label="90° ↻" onPress={onRotateRight} disabled={busy} />
        <ToolButton
          label="איפוס"
          onPress={onReset}
          disabled={busy || !hasChanges}
        />
        <ToolButton
          label={isSaving ? 'שומר...' : 'שמור עותק'}
          onPress={onSave}
          disabled={busy || !hasChanges}
          primary
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cropRow}>
        {CROP_OPTIONS.map(option => {
          const active = cropMode === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={`חיתוך: ${option.label}`}
              accessibilityState={{selected: active}}
              style={[styles.cropChip, active && styles.cropChipActive]}
              disabled={busy}
              onPress={() => onCropModeChange(option.id)}>
              <Text style={[styles.cropText, active && styles.cropTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isProcessing ? (
        <View style={styles.processingRow}>
          <ActivityIndicator color="#2563eb" size="small" />
          <Text style={styles.processingText}>מעדכן תצוגה מקדימה...</Text>
        </View>
      ) : null}
    </View>
  );
}

function ToolButton({
  label,
  onPress,
  disabled,
  primary,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.toolBtn,
        primary && styles.toolBtnPrimary,
        disabled && styles.toolBtnDisabled,
      ]}
      disabled={disabled}
      onPress={onPress}>
      <Text style={[styles.toolText, primary && styles.toolTextPrimary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  toolBtnPrimary: {
    backgroundColor: '#2563eb',
  },
  toolBtnDisabled: {
    opacity: 0.5,
  },
  toolText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    writingDirection: 'rtl',
  },
  toolTextPrimary: {
    color: '#ffffff',
  },
  cropRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    paddingVertical: 2,
  },
  cropChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  cropChipActive: {
    backgroundColor: '#2563eb',
  },
  cropText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    writingDirection: 'rtl',
  },
  cropTextActive: {
    color: '#ffffff',
  },
  processingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  processingText: {
    fontSize: 13,
    color: '#64748b',
    writingDirection: 'rtl',
  },
});
