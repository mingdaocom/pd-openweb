const presetImageLoaders = {
  1: () => import('./images/1.jpg'),
  2: () => import('./images/2.jpg'),
  3: () => import('./images/3.jpg'),
  4: () => import('./images/4.jpg'),
  5: () => import('./images/5.jpg'),
  6: () => import('./images/6.jpg'),
  7: () => import('./images/7.jpg'),
  8: () => import('./images/8.jpg'),
  9: () => import('./images/9.jpg'),
  10: () => import('./images/10.jpg'),
  11: () => import('./images/11.jpg'),
  12: () => import('./images/12.jpg'),
  13: () => import('./images/13.jpg'),
  14: () => import('./images/14.jpg'),
  15: () => import('./images/15.jpg'),
  16: () => import('./images/16.jpg'),
};

const presetImageCache = {};

export const normalizePresetImageIndex = index => {
  const value = Number(index);
  return Number.isInteger(value) && presetImageLoaders[value] ? value : null;
};

export const loadPresetImage = index => {
  const normalizedIndex = normalizePresetImageIndex(index);

  if (!normalizedIndex) {
    return Promise.resolve(null);
  }

  if (presetImageCache[normalizedIndex]) {
    return Promise.resolve(presetImageCache[normalizedIndex]);
  }

  return presetImageLoaders[normalizedIndex]().then(module => {
    const image = module.default || module;
    presetImageCache[normalizedIndex] = image;
    return image;
  });
};
