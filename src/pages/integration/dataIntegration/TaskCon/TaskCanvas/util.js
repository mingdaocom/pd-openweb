import TaskFlow from 'src/pages/integration/api/taskFlow.js';

export const formatTaskNodeData = (list = [], firstId) => {
  // const firstId = "source1";
  if (list.length <= 0) {
    return [];
  }
  let parentIds = [];
  let maxY = 0;

  const generateCoordinateX = (currentId, x, y) => {
    const currentItem = list.find(item => item.nodeId === currentId);

    currentItem.x = currentId === firstId ? 0 : x;
    currentItem.y = currentId === firstId ? 0 : y;

    if (currentItem.prevIds.length) {
      parentIds = parentIds.concat(currentItem.prevIds);
    }

    currentItem.nextIds.forEach(o => {
      generateCoordinateX(o, currentItem.x + 1, currentItem.y);
    });
  };

  const generateCoordinateParent = (parentIds, newY) => {
    parentIds.forEach(currentId => {
      const currentItem = list.find(item => item.nodeId === currentId);
      if (!currentItem) {
        return;
      }
      const parentNode = list.find(obj => obj.prevIds.indexOf(currentId) > -1);
      if (!newY || parentNode.prevIds.indexOf(currentId) > 0) {
        maxY = maxY + 1;
      }
      // console.log(currentItem, parentNode);
      currentItem.x = parentNode.x - 1;
      currentItem.y = maxY;

      generateCoordinateParent(currentItem.prevIds, maxY);
    });
  };

  // 所有大于0 x轴平移
  const translationX = () => {
    let minX = 0;

    list.forEach(item => {
      if (item.x < minX) {
        minX = item.x;
      }
    });

    minX = Math.abs(minX);

    list.forEach(item => {
      if (item.x !== 0 || item.y !== 0) {
        item.x = item.x + minX;
      }
    });
  };

  // 计算所有行的位置情况
  const calculationAllRowPosition = () => {
    const rowObj = {};
    let allowMergeRow = [];

    list
      .filter(item => item.y > 0)
      .map(item => {
        if (!rowObj[item.y]) {
          rowObj[item.y] = [item.x];
        } else {
          rowObj[item.y].push(item.x);
        }
      });

    Object.keys(rowObj).forEach((key, index) => {
      if (index !== Object.keys(rowObj).length - 1) {
        const mergeArr = rowObj[key].concat(rowObj[Object.keys(rowObj)[index + 1]]);
        if (_.uniq(mergeArr).length === mergeArr.length) {
          allowMergeRow.push(parseInt(key) + 1);
        }
      }
    });

    allowMergeRow
      .sort((a, b) => b - a)
      .forEach(line => {
        list
          .filter(item => item.y >= line)
          .map(item => {
            item.y = item.y - 1;
          });
      });
  };

  generateCoordinateX(firstId);
  generateCoordinateParent(parentIds);
  translationX();
  calculationAllRowPosition();

  return list;
};

//计算pathIds
export const formatDataWithLine = list => {
  console.log(list)
  const l = list.map(o => {
    let pathIds = [];
    if (o.nextIds.length > 0) {
      o.nextIds.map(it => {
        pathIds.push({ fromDt: o, toDt: list.find(a => a.nodeId === it) });
      });
    }
    return {
      ...o,
      pathIds,
    };
  });
  list.map(o => {
    if (o.prevIds.length > 0) {
      o.prevIds.map(it => {
        let index = list.findIndex(a => a.nodeId === it);
        if (index > -1) {
          l[index] = { ...l[index], pathIds: [...(l[index].pathIds || []), { fromDt: l[index], toDt: o }] };
        }
      });
    }
  });
  console.log(l)
  return l;
};

//预览节点数据
export const getNodeData = (nodeId, list) => {
  if (!nodeId) {
    return [];
  }
  const data = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId);
  const d = data.find(o => o.nodeId === nodeId) || {};
  return d;
};

//通过中间类型转换成筛选组件使用的type
export const formatControls = (controls) => {
  let templateControls = []
  templateControls = controls.map(o => {
    switch (o.jdbcTypeId) {
      case 93:
      case 92:
      case 2013:
      case 91:
      case 2014:
        return { ...o, type: 16, controlId: o.id, controlName: o.name }
      case 6:
      case 3:
      case 8:
      case -6:
      case 4:
      case 2:
      case -5:
      case -7:
      case 16:
      case 5:
      case 7:
        return { ...o, type: 6, controlId: o.id, controlName: o.name }
      default:
        //其他都转成文本类型
        return { ...o, type: 2, controlId: o.id, controlName: o.name }
    }
  })
  return templateControls
}

export const getNodeInfo = async (projectId, flowId, nodeId) => {
  const node = await TaskFlow.getNodeInfo({
    projectId,
    flowId,
    nodeId,
  });
  return node;
};
