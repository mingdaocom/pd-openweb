// code from MDRN: exExec.ts

// code from MDRN: exExec.ts

const operates = {
  divide: (arg1, arg2) => {
    if (arg2.name === null || arg2 === null || arg1.name === null || arg2 === null) {
      return null;
    }
    if (arg2 === Infinity) {
      return null;
    }

    return accDiv(nullToZero(exExec(arg1)), nullToZero(exExec(arg2)));
  },
  multiply: (arg1, arg2) => {
    if (arg2.name === null || arg2 === null || arg1.name === null || arg2 === null) {
      return null;
    }

    const num1 = exExec(arg1);
    const num2 = exExec(arg2);

    if (num1 === null && num2 === null) {
      return 0;
    }

    return accMul(nullToOne(num1), nullToOne(num2));
  },
  add: (arg1, arg2) => {
    if (arg2.name === null || arg2 === null || arg1.name === null || arg2 === null) {
      return null;
    }

    return accAdd(nullToZero(exExec(arg1)), nullToZero(exExec(arg2)));
  },
  subtract: (arg1, arg2) => {
    if (arg2.name === null || arg2 === null || arg1.name === null || arg2 === null) {
      return null;
    }

    return accSub(nullToZero(exExec(arg1)), nullToZero(exExec(arg2)));
  },
};

const cFunctions = {
  cSUM: (...args) => {
    return args.reduce((pre, cur) => {
      return accAdd(nullToZero(pre), nullToZero(exExec(cur)));
    }, 0);
  },
  cMIN: (...args) => {
    return (
      args
        .map(item => exExec(item))
        .filter(item => item !== null)
        .sort((a, b) => accSub(a, b))[0] || 0
    );
  },
  cMAX: (...args) => {
    return (
      args
        .map(item => exExec(item))
        .filter(item => item !== null)
        .sort((a, b) => accSub(b, a))[0] || 0
    );
  },
  cAVG: (...args) => {
    args = args.map(item => exExec(item)).filter(item => item !== null);
    if (args.length === 0) {
      return 0;
    }

    return accDiv(
      args.reduce((pre, cur) => {
        return accAdd(pre, cur);
      }, 0),
      args.length
    );
  },
  cPRODUCT: (...args) => {
    args = args.map(arg => exExec(arg));
    if (args.filter(arg => arg !== null).length === 0) {
      return 0;
    }

    return args.reduce((pre, cur) => {
      return accMul(nullToZero(pre), nullToZero(cur));
    }, 1);
  },
};

const TreeType = {
  OperatorNode: 'OperatorNode',
  FunctionNode: 'FunctionNode',
  ConstantNode: 'ConstantNode',
  ParenthesisNode: 'ParenthesisNode',
  SymbolNode: 'SymbolNode',
};

/**
 * @param value 处理值，null改成0
 */
function nullToZero(value) {
  return value === null ? 0 : value;
}

/**
 * @param value 处理值，null改成1
 */
function nullToOne(value) {
  return value === null ? 1 : value;
}

/**
 * 计算
 * @param tree tree
 */
function exExec(tree) {
  if (tree.type === TreeType.OperatorNode) {
    return operates[tree.fn].apply(null, tree.args);
  } else if (tree.type === TreeType.FunctionNode) {
    return cFunctions[tree.fn.name].apply(null, tree.args);
  } else if (tree.type === TreeType.ConstantNode) {
    return parseFloat(tree.value);
  } else if (tree.type === TreeType.ParenthesisNode) {
    return exExec(tree.content);
  } else if (tree.type === TreeType.SymbolNode) {
    return null;
  }
}

/* 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。
* 这个函数返回较为精确的加法结果。
* 调用：accAdd(arg1,arg2)
* 返回值：arg1加上arg2的精确结果
*/
function accAdd(arg1, arg2) {
  let r1 = 0;
  let r2 = 0;

  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    //
  }

  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    //
  }

  const m = Math.pow(10, Math.max(r1, r2));

  return (arg1 * m + arg2 * m) / m;
}

/* 说明：javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。
* 这个函数返回较为精确的减法结果。
* 调用：accSub(arg1,arg2)
* 返回值：arg1减上arg2的精确结果
*/
function accSub(arg1, arg2) {
  return accAdd(arg1, -arg2);
}

/* 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。
* 这个函数返回较为精确的乘法结果。
* 调用：accMul(arg1,arg2)
* 返回值：arg1乘以arg2的精确结果
*/
function accMul(arg1, arg2) {
  let m = 0;
  const s1 = arg1.toString();
  const s2 = arg2.toString();

  try {
    m += s1.split('.')[1].length;
  } catch (e) {
    //
  }

  try {
    m += s2.split('.')[1].length;
  } catch (e) {
    //
  }

  return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
}

/* 说明：javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。
* 这个函数返回较为精确的除法结果。
* 调用：accMul(arg1,arg2)
* 返回值：arg1除以arg2的精确结果
*/
function accDiv(arg1, arg2) {
  let t1 = 0;
  let t2 = 0;

  try {
    t1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    //
  }

  try {
    t2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    //
  }

  const r1 = Number(arg1.toString().replace('.', ''));
  const r2 = Number(arg2.toString().replace('.', ''));

  const res = r1 / r2 * Math.pow(10, t2 - t1);

  if (res.toString().replace(/\d+\./, '').length > 9) {
    return parseFloat(res.toFixed(9));
  }

  return res;
}

export default {
  exExec,
};
