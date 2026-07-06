import {
  a11yButton,
  a11yHeader,
  a11yHidden,
  a11yImage,
  a11yProgress,
  a11yTab,
  flowProgressLabel,
} from '@/utils/accessibility';

describe('accessibility helpers', () => {
  it('builds button props with state', () => {
    expect(a11yButton('המשך', {disabled: true, hint: 'מעבר למסך הבא'})).toEqual({
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: 'המשך',
      accessibilityHint: 'מעבר למסך הבא',
      accessibilityState: {disabled: true},
    });
  });

  it('builds tab props with selected state', () => {
    expect(a11yTab('וידאו', true).accessibilityState).toEqual({selected: true});
  });

  it('builds progress label in Hebrew', () => {
    expect(flowProgressLabel(2, 'סצנה')).toBe('שלב 2 מתוך 4: סצנה');
  });

  it('exports hidden and image helpers', () => {
    expect(a11yHidden.accessible).toBe(false);
    expect(a11yImage('תמונה ממוזערת').accessibilityRole).toBe('image');
    expect(a11yHeader('כותרת').accessibilityRole).toBe('header');
    expect(a11yProgress('טוען', {now: 2, max: 4}).accessibilityRole).toBe(
      'progressbar',
    );
  });
});
