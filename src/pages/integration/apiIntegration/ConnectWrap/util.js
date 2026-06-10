//计算节点数据
export const getNodeList = res => {
  let l = [];
  if (!res || !res.flowNodeMap) return l;

  const getList = startEventId => {
    let data = res.flowNodeMap[startEventId];
    if (!data) return;
    l.push(data);
    if (res.flowNodeMap[data.nextId]) {
      getList(data.nextId);
    }
  };

  getList(res.startEventId);
  return l;
};
