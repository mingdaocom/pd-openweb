const removeContainer = container => {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
};

export const createFunctionWrapStore = () => {
  let nextId = 0;
  let items = [];
  const listeners = new Set();

  const emitChange = () => {
    listeners.forEach(listener => listener());
  };

  const destroyItems = currentItems => {
    currentItems.forEach(item => removeContainer(item.container));
  };

  return {
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      return items;
    },
    open(Comp, props = {}) {
      const container = document.createElement('div');
      const item = {
        id: ++nextId,
        Comp,
        props,
        container,
      };

      document.body.appendChild(container);
      items = [...items, item];
      emitChange();
    },
    destroy(id) {
      const currentItem = items.find(item => item.id === id);

      if (!currentItem) return;

      items = items.filter(item => item.id !== id);
      emitChange();
      removeContainer(currentItem.container);
    },
    destroyAll() {
      if (!items.length) return;

      const currentItems = items;
      items = [];
      emitChange();
      destroyItems(currentItems);
    },
    clear() {
      const currentItems = items;
      items = [];
      destroyItems(currentItems);
    },
  };
};
