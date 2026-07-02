import {
  base64ToUtf8,
  utf8ToBase64,
} from '@/services/tripod/tripodEncoding';

describe('tripodEncoding', () => {
  it('round-trips Hebrew text through base64', () => {
    const original = 'פקודת חצובה';
    expect(base64ToUtf8(utf8ToBase64(original))).toBe(original);
  });

  it('round-trips JSON command payload', () => {
    const payload = JSON.stringify({cmd: 'MOVE', pan_delta: 3});
    expect(base64ToUtf8(utf8ToBase64(payload))).toBe(payload);
  });
});
