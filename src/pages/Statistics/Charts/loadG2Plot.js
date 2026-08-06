let g2plotPromise;

const loadG2Plot = () => {
  if (!g2plotPromise) {
    g2plotPromise = import('@antv/g2plot');
  }

  return g2plotPromise;
};

export default loadG2Plot;
