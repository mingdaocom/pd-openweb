export const registerModalEscClose = ({ open, className, fn }) => {
  if (!open || !window.closeFns) return;

  const id = Math.random() * Math.random();
  window.closeindex = (window.closeindex || 0) + 1;
  window.closeFns[id] = {
    id,
    className,
    index: window.closeindex,
    fn,
  };

  return () => {
    if (window.closeFns) {
      delete window.closeFns[id];
    }
  };
};
