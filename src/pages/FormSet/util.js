export const isOpenPermit = (type, list = [], viewId) => {
  if (Array.isArray(list)) {
    let data = list.find(o => o.type === type);
    if (!data || list.length <= 0) {
      return true;
    }
    if (type < 20) {
      return !data ? true : data.state;
    } else {
      if (!data) {
        return true;
      }
      if (!viewId) {
        return !!data.state;
      }
      // data.viewIds.length <= 0 所有视图
      return !!data.state && (data.viewIds.includes(viewId) || data.viewIds.length <= 0);
    }
  } else {
    return true;
  }
};
