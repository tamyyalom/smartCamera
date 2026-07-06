import type {AccessibilityRole, AccessibilityState} from 'react-native';

interface ButtonA11yOptions {
  hint?: string;
  disabled?: boolean;
  selected?: boolean;
}

export function a11yButton(label: string, options?: ButtonA11yOptions) {
  const state: AccessibilityState = {};
  if (options?.disabled) {
    state.disabled = true;
  }
  if (options?.selected !== undefined) {
    state.selected = options.selected;
  }

  return {
    accessible: true,
    accessibilityRole: 'button' as AccessibilityRole,
    accessibilityLabel: label,
    accessibilityHint: options?.hint,
    accessibilityState: Object.keys(state).length > 0 ? state : undefined,
  };
}

export function a11yHeader(label: string) {
  return {
    accessible: true,
    accessibilityRole: 'header' as AccessibilityRole,
    accessibilityLabel: label,
  };
}

export function a11yImage(label: string) {
  return {
    accessible: true,
    accessibilityRole: 'image' as AccessibilityRole,
    accessibilityLabel: label,
  };
}

export function a11yTab(label: string, selected: boolean) {
  return {
    accessible: true,
    accessibilityRole: 'tab' as AccessibilityRole,
    accessibilityLabel: label,
    accessibilityState: {selected},
  };
}

export function a11yProgress(label: string, value: {now: number; max: number}) {
  return {
    accessible: true,
    accessibilityRole: 'progressbar' as AccessibilityRole,
    accessibilityLabel: label,
    accessibilityValue: {min: 1, max: value.max, now: value.now, text: label},
  };
}

export const a11yHidden = {
  accessible: false,
  importantForAccessibility: 'no-hide-descendants' as const,
};

export function flowProgressLabel(currentStep: number, stepLabel: string): string {
  return `שלב ${currentStep} מתוך 4: ${stepLabel}`;
}
