import _ from 'lodash';
import {
  BASE_PRINT_CONTENT_WIDTH,
  BASE_PRINT_PAGE_WIDTH,
  DEFAULT_PRINT_PAPER_DIRECTION,
  DEFAULT_PRINT_PAPER_SIZE,
  PAPER_DIRECTION_OPTIONS,
  PAPER_SIZE_OPTIONS,
} from './config';

const PREVIEW_PAGE_MIN_WIDTH = 560;
const PREVIEW_PADDING_X = 36;
const MIN_PREVIEW_CONTENT_WIDTH = 320;
const BASE_PREVIEW_PAPER_OPTION =
  PAPER_SIZE_OPTIONS.find(item => item.value === DEFAULT_PRINT_PAPER_SIZE) || PAPER_SIZE_OPTIONS[0];
const MAX_CONFIGURED_PAPER_WIDTH = _.max(PAPER_SIZE_OPTIONS.map(item => Math.max(item.width, item.height))) || 0;
const PREVIEW_PAGE_MAX_WIDTH = Math.round(
  (BASE_PRINT_PAGE_WIDTH * MAX_CONFIGURED_PAPER_WIDTH) / BASE_PREVIEW_PAPER_OPTION.width,
);

export const getPrintPaperSizeOption = paperSize =>
  PAPER_SIZE_OPTIONS.find(item => item.value === paperSize) ||
  PAPER_SIZE_OPTIONS.find(item => item.value === DEFAULT_PRINT_PAPER_SIZE);

export const getPrintPaperDirectionOption = paperDirection =>
  PAPER_DIRECTION_OPTIONS.find(item => item.value === paperDirection) ||
  PAPER_DIRECTION_OPTIONS.find(item => item.value === DEFAULT_PRINT_PAPER_DIRECTION);

export const getPrintPaperLayout = ({
  paperSize = DEFAULT_PRINT_PAPER_SIZE,
  paperDirection = DEFAULT_PRINT_PAPER_DIRECTION,
} = {}) => {
  const basePaperOption = getPrintPaperSizeOption(DEFAULT_PRINT_PAPER_SIZE);
  const currentPaperOption = getPrintPaperSizeOption(paperSize);
  const currentPaperWidth = paperDirection === 'horizontal' ? currentPaperOption.height : currentPaperOption.width;
  const scaledPageWidth = Math.round((BASE_PRINT_PAGE_WIDTH * currentPaperWidth) / basePaperOption.width);
  const previewPageWidth = _.clamp(scaledPageWidth, PREVIEW_PAGE_MIN_WIDTH, PREVIEW_PAGE_MAX_WIDTH);
  const previewContentWidth = Math.max(previewPageWidth - PREVIEW_PADDING_X * 2, MIN_PREVIEW_CONTENT_WIDTH);
  const contentScale = previewContentWidth / BASE_PRINT_CONTENT_WIDTH;

  return {
    previewPageWidth,
    previewContentWidth,
    contentScale,
  };
};

export const getPrintLayoutConfig = advanceSettings => {
  const advanceMap = _.keyBy(advanceSettings || [], 'key');
  const paperSize = advanceMap.paperSize?.value || DEFAULT_PRINT_PAPER_SIZE;
  const paperDirection = advanceMap.paperDirection?.value || DEFAULT_PRINT_PAPER_DIRECTION;
  const paperSizeOption = getPrintPaperSizeOption(paperSize);
  const paperDirectionOption = getPrintPaperDirectionOption(paperDirection);

  return {
    advanceMap,
    paperSize,
    paperDirection,
    paperSizeOption,
    paperDirectionOption,
    layout: getPrintPaperLayout({ paperSize, paperDirection }),
  };
};
