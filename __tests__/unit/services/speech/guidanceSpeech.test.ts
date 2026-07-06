import {shouldSpeakGuidance} from '@/services/speech/guidanceSpeech';

describe('shouldSpeakGuidance', () => {
  const now = 10_000;

  it('rejects empty text', () => {
    expect(shouldSpeakGuidance('  ', null, 0, now)).toBe(false);
  });

  it('allows first guidance message', () => {
    expect(shouldSpeakGuidance('התקרבי למצלמה', null, 0, now)).toBe(true);
  });

  it('skips repeated message inside cooldown window', () => {
    expect(
      shouldSpeakGuidance('התקרבי למצלמה', 'התקרבי למצלמה', now - 1000, now, 8000),
    ).toBe(false);
  });

  it('allows repeated message after cooldown window', () => {
    expect(
      shouldSpeakGuidance('התקרבי למצלמה', 'התקרבי למצלמה', now - 9000, now, 8000),
    ).toBe(true);
  });

  it('allows new message immediately', () => {
    expect(
      shouldSpeakGuidance('מצוין — החזיקי', 'התקרבי למצלמה', now - 1000, now),
    ).toBe(true);
  });
});
