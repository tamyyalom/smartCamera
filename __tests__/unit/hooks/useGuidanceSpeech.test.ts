import ReactTestRenderer from 'react-test-renderer';
import {useGuidanceSpeech} from '@/hooks/useGuidanceSpeech';
import * as guidanceSpeech from '@/services/speech/guidanceSpeech';
import {renderHookResult} from '../../helpers/renderHook';

jest.mock('@/services/speech/guidanceSpeech', () => ({
  shouldSpeakGuidance: jest.fn(() => true),
  speakGuidance: jest.fn(() => Promise.resolve()),
  stopGuidanceSpeech: jest.fn(() => Promise.resolve()),
}));

const mockedShouldSpeak = guidanceSpeech.shouldSpeakGuidance as jest.MockedFunction<
  typeof guidanceSpeech.shouldSpeakGuidance
>;
const mockedSpeak = guidanceSpeech.speakGuidance as jest.MockedFunction<
  typeof guidanceSpeech.speakGuidance
>;
const mockedStop = guidanceSpeech.stopGuidanceSpeech as jest.MockedFunction<
  typeof guidanceSpeech.stopGuidanceSpeech
>;

describe('useGuidanceSpeech', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedShouldSpeak.mockReturnValue(true);
  });

  it('speaks new guidance when enabled', async () => {
    await renderHookResult(() =>
      useGuidanceSpeech({
        guidanceText: 'התקרבי למצלמה',
        enabled: true,
      }),
    );

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    expect(mockedSpeak).toHaveBeenCalledWith('התקרבי למצלמה');
  });

  it('does not speak when guidance channel is disabled', async () => {
    await renderHookResult(() =>
      useGuidanceSpeech({
        guidanceText: 'התקרבי למצלמה',
        enabled: false,
      }),
    );

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    expect(mockedSpeak).not.toHaveBeenCalled();
  });

  it('toggles voice guidance off', async () => {
    const hook = await renderHookResult(() =>
      useGuidanceSpeech({
        guidanceText: 'התקרבי למצלמה',
        enabled: true,
      }),
    );

    await ReactTestRenderer.act(async () => {
      hook.getCurrent().toggleVoice();
      await Promise.resolve();
    });

    expect(hook.getCurrent().voiceEnabled).toBe(false);
  });

  it('stops speech on unmount', async () => {
    const hook = await renderHookResult(() =>
      useGuidanceSpeech({
        guidanceText: 'התקרבי למצלמה',
        enabled: true,
      }),
    );

    await hook.unmount();
    expect(mockedStop).toHaveBeenCalled();
  });
});
