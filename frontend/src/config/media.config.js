export const mediaConfig = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    facingMode: 'user',
    frameRate: { ideal: 30, max: 30 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1,
    sampleRate: 48000,
  },
  recordingOptions: {
    mimeType: 'video/webm;codecs=vp9,opus',
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 2500000,
  },
};