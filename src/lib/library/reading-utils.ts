export interface ReadingMetrics {
  readDurationSeconds: number;
  scrollPercentage: number;
  lastPosition: number;
}

const clampNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return min;
  }

  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
};

const round = (value: number) => Math.round(Number.isFinite(value) ? value : 0);

export const computeScrollProgress = (
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
): number => {
  if (scrollHeight <= 0) {
    return 0;
  }

  const adjustedScrollHeight = Math.max(scrollHeight - Math.max(clientHeight, 1), 1);
  const ratio = clampNumber(scrollTop, 0, adjustedScrollHeight) / adjustedScrollHeight;
  return clampNumber(Math.round(ratio * 100), 0, 100);
};

export const isReadingComplete = (scrollPercentage: number, threshold = 95) =>
  clampNumber(scrollPercentage, 0, 100) >= threshold;

export const shouldPersistReadingHistory = (
  metrics: ReadingMetrics,
  hasExistingEntry: boolean,
) => {
  const duration = round(metrics.readDurationSeconds);
  const progress = clampNumber(round(metrics.scrollPercentage), 0, 100);

  if (hasExistingEntry) {
    return duration >= 5 || progress >= 5;
  }

  return duration >= 10 || progress >= 25;
};

interface BuildReadingHistoryPayloadOptions extends Partial<ReadingMetrics> {
  historyId?: string | null;
  postId: string;
  completionThreshold?: number;
}

export const buildReadingHistoryPayload = ({
  historyId,
  postId,
  readDurationSeconds = 0,
  scrollPercentage = 0,
  lastPosition = 0,
  completionThreshold = 95,
}: BuildReadingHistoryPayloadOptions) => {
  const roundedDuration = Math.max(0, round(readDurationSeconds));
  const roundedScroll = clampNumber(round(scrollPercentage), 0, 100);
  const roundedPosition = Math.max(0, round(lastPosition));

  return {
    historyId: historyId ?? undefined,
    postId,
    readDurationSeconds: roundedDuration,
    scrollPercentage: roundedScroll,
    lastPosition: roundedPosition,
    completed: isReadingComplete(roundedScroll, completionThreshold),
  };
};
