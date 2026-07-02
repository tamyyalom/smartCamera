import React from 'react';
import {Alert} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import ShareLib from 'react-native-share';
import {MediaFileRow} from '@/components/MediaFileRow';
import {VideoThumbnail} from '@/components/media/VideoThumbnail';
import {CameraControlsPanel} from '@/components/camera/CameraControlsPanel';
import {CameraUnavailableView} from '@/components/camera/CameraUnavailableView';
import {PhotoCaptureControls} from '@/components/camera/PhotoCaptureControls';
import {RecordingControls} from '@/components/camera/RecordingControls';
import {FlowScreenLayout} from '@/components/navigation/FlowScreenLayout';
import {SceneCategoryTabs} from '@/components/scene/SceneCategoryTabs';
import {TripodDeviceRow} from '@/components/tripod/TripodDeviceRow';
import {TripodStatusPanel} from '@/components/tripod/TripodStatusPanel';
import {
  findPressableByLabel,
  findTextContaining,
  textContent,
} from '../../helpers/renderHook';

jest.mock('@/services/media', () => ({
  formatDuration: jest.fn(() => '1:05'),
  formatMediaDate: jest.fn(() => '1 בינו׳ 2025'),
  getMimeType: jest.fn(() => 'image/jpeg'),
  toFileUri: jest.fn((path: string) =>
    path.startsWith('file://') ? path : `file://${path}`,
  ),
}));

const photoFile = {
  id: 'p1',
  type: 'photo' as const,
  filename: 'sunset.jpg',
  uri: '/mock/sunset.jpg',
  createdAt: Date.now(),
};

const videoFile = {
  id: 'v1',
  type: 'video' as const,
  filename: 'clip.mp4',
  uri: '/mock/clip.mp4',
  createdAt: Date.now(),
  durationMs: 65_000,
};

describe('MediaFileRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders photo row with actions', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <MediaFileRow
          file={photoFile}
          onView={jest.fn()}
          onEdit={jest.fn()}
          onDeleted={jest.fn()}
        />,
      );
    });

    expect(findTextContaining(tree.root, 'sunset.jpg')).toBe(true);
    expect(findTextContaining(tree.root, 'תמונה')).toBe(true);
    expect(findTextContaining(tree.root, 'הצגה')).toBe(true);
    expect(tree.root.findByType('Image' as never)).toBeTruthy();
  });

  it('renders video row with thumbnail', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <MediaFileRow
          file={videoFile}
          onView={jest.fn()}
          onEdit={jest.fn()}
          onDeleted={jest.fn()}
        />,
      );
    });

    expect(findTextContaining(tree.root, 'וידאו')).toBe(true);
    expect(tree.root.findByType('Video' as never)).toBeTruthy();
  });

  it('calls onView when main row pressed', () => {
    const onView = jest.fn();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <MediaFileRow
          file={photoFile}
          onView={onView}
          onEdit={jest.fn()}
          onDeleted={jest.fn()}
        />,
      );
    });

    const viewButton = findPressableByLabel(tree.root, 'הצגה');
    ReactTestRenderer.act(() => {
      viewButton?.props.onPress();
    });
    expect(onView).toHaveBeenCalledWith(photoFile);
  });

  it('opens share sheet', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <MediaFileRow
          file={photoFile}
          onView={jest.fn()}
          onEdit={jest.fn()}
          onDeleted={jest.fn()}
        />,
      );
    });

    const shareButton = findPressableByLabel(tree.root, 'שיתוף');
    await ReactTestRenderer.act(async () => {
      await shareButton?.props.onPress();
    });
    expect(ShareLib.open).toHaveBeenCalled();
  });
});

describe('VideoThumbnail', () => {
  it('shows duration badge when provided', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <VideoThumbnail uri="/mock/clip.mp4" durationLabel="1:05" />,
      );
    });

    expect(findTextContaining(tree.root, '1:05')).toBe(true);
    expect(findTextContaining(tree.root, '▶')).toBe(true);
  });
});

describe('PhotoCaptureControls', () => {
  it('shows idle hint', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <PhotoCaptureControls isCapturing={false} onCapture={jest.fn()} />,
      );
    });
    expect(findTextContaining(tree.root, 'לחץ לצילום')).toBe(true);
  });

  it('shows saving state', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <PhotoCaptureControls isCapturing onCapture={jest.fn()} />,
      );
    });
    expect(findTextContaining(tree.root, 'שומר')).toBe(true);
    expect(tree.root.findByType('ActivityIndicator' as never)).toBeTruthy();
  });
});

describe('RecordingControls', () => {
  it('shows start hint when idle', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <RecordingControls
          phase="idle"
          elapsedLabel="0:00"
          isBusy={false}
          onStart={jest.fn()}
          onStop={jest.fn()}
          onPause={jest.fn()}
          onResume={jest.fn()}
          onCancel={jest.fn()}
          onSnapshot={jest.fn()}
        />,
      );
    });
    expect(findTextContaining(tree.root, 'לחץ להתחלת הקלטה')).toBe(true);
  });

  it('shows pause controls while recording', () => {
    const onPause = jest.fn();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <RecordingControls
          phase="recording"
          elapsedLabel="0:12"
          isBusy={false}
          onStart={jest.fn()}
          onStop={jest.fn()}
          onPause={onPause}
          onResume={jest.fn()}
          onCancel={jest.fn()}
          onSnapshot={jest.fn()}
        />,
      );
    });

    expect(findTextContaining(tree.root, 'השהה')).toBe(true);
    const pauseButton = findPressableByLabel(tree.root, 'השהה');
    ReactTestRenderer.act(() => {
      pauseButton?.props.onPress();
    });
    expect(onPause).toHaveBeenCalled();
  });

  it('shows resume when paused', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <RecordingControls
          phase="paused"
          elapsedLabel="0:30"
          isBusy={false}
          onStart={jest.fn()}
          onStop={jest.fn()}
          onPause={jest.fn()}
          onResume={jest.fn()}
          onCancel={jest.fn()}
          onSnapshot={jest.fn()}
        />,
      );
    });
    expect(findTextContaining(tree.root, 'מושהה')).toBe(true);
    expect(findTextContaining(tree.root, 'המשך')).toBe(true);
  });
});

describe('CameraControlsPanel', () => {
  it('adjusts zoom via stepper', () => {
    const onZoomChange = jest.fn();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <CameraControlsPanel
          zoom={2}
          minZoom={1}
          maxZoom={5}
          exposure={0}
          minExposure={-2}
          maxExposure={2}
          supportsExposure
          onZoomChange={onZoomChange}
          onExposureChange={jest.fn()}
          onReset={jest.fn()}
        />,
      );
    });

    const pressables = tree.root.findAll(
      node => typeof node.props?.onPress === 'function',
    );
    const zoomPlus = pressables.find(node => {
      const texts = node.findAllByType('Text' as never);
      return texts.some(t => textContent(t) === '+');
    });
    expect(zoomPlus).toBeDefined();
    ReactTestRenderer.act(() => {
      zoomPlus?.props.onPress();
    });
    expect(onZoomChange).toHaveBeenCalledWith(2.1);
  });
});

describe('CameraUnavailableView', () => {
  it('renders message and back action', () => {
    const onBack = jest.fn();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<CameraUnavailableView onBack={onBack} />);
    });

    expect(findTextContaining(tree.root, 'לא נמצאה מצלמה')).toBe(true);
    const back = findPressableByLabel(tree.root, 'חזרה');
    ReactTestRenderer.act(() => {
      back?.props.onPress();
    });
    expect(onBack).toHaveBeenCalled();
  });
});

describe('FlowScreenLayout', () => {
  it('renders title, children and footer', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <FlowScreenLayout
          step={2}
          title="כותרת בדיקה"
          subtitle="תת כותרת"
          onBack={jest.fn()}
          footer={<React.Fragment>footer-content</React.Fragment>}>
          <React.Fragment>body-content</React.Fragment>
        </FlowScreenLayout>,
      );
    });

    expect(findTextContaining(tree.root, 'כותרת בדיקה')).toBe(true);
    expect(findTextContaining(tree.root, 'תת כותרת')).toBe(true);
    expect(findTextContaining(tree.root, 'חזרה')).toBe(true);
  });
});

describe('SceneCategoryTabs', () => {
  it('calls onChange for still tab', () => {
    const onChange = jest.fn();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SceneCategoryTabs
          activeMode="video"
          videoCount={9}
          stillCount={9}
          onChange={onChange}
        />,
      );
    });

    const stillTab = findPressableByLabel(tree.root, 'סטילס');
    ReactTestRenderer.act(() => {
      stillTab?.props.onPress();
    });
    expect(onChange).toHaveBeenCalledWith('photo');
  });
});

describe('TripodDeviceRow', () => {
  it('shows device name and selection state', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <TripodDeviceRow
          device={{id: 't1', name: 'SmartCamera Tripod', rssi: -50}}
          selected
          onPress={jest.fn()}
        />,
      );
    });

    expect(findTextContaining(tree.root, 'SmartCamera Tripod')).toBe(true);
    expect(findTextContaining(tree.root, '-50')).toBe(true);
  });
});

describe('TripodStatusPanel', () => {
  it('shows connected metrics', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <TripodStatusPanel
          device={{id: 't1', name: 'Tripod'}}
          state={{
            pan: 10,
            tilt: -5,
            height: 120,
            last_command_ms: 0,
            connected: true,
          }}
          modeLabel="Mock"
          lastAction="מחובר"
        />,
      );
    });

    expect(findTextContaining(tree.root, 'מחובר')).toBe(true);
    expect(findTextContaining(tree.root, 'Mock')).toBe(true);
    expect(findTextContaining(tree.root, '10.0°')).toBe(true);
  });
});
