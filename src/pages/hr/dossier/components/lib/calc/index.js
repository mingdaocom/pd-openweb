// code from MDRN: exExec.ts

// code from MDRN: exExec.ts
import { accSub, accAdd, accDiv, accMul } from 'src/util';

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
      args.length,
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

export default {
  exExec,
};
