//计算节点数据
export const getNodeList = res => {
  let l = [];
  const getList = startEventId => {
    let data = res.flowNodeMap[startEventId];
    l.push(data);
    if (res.flowNodeMap[data.nextId]) {
      getList(data.nextId);
    }
  };
  getList(res.startEventId);
  return l;
};
