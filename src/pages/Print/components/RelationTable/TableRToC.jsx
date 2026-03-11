import React, { memo } from 'react';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import STYLE_PRINT from '../../core/exportWordPrintTemCssString';

// 行转列
const TableRToC = ({ list = [], dataSource = [], tableProps }) => {
  const renderMap = list.reduce((acc, item) => {
    acc[item.dataIndex === 'number' ? 'number' : item.controlId] = item.render;
    return acc;
  }, {});
  const max = list.reduce((m, { width = 0 }) => Math.max(m, width), 0);
  const maxNumberWidth = Math.min(max, 320);
  // 剩余空间
  const restWidth = 728 - maxNumberWidth;
  const itemTdWidth = Math.max(Math.floor(restWidth / dataSource.length), 30);

  return (
    <table className="printRelationTable tableRtoC" {...tableProps}>
      {list.map((row, rowIndex) => {
        const key = row.dataIndex === 'number' ? 'number' : row.controlId;

        return (
          <tr key={`row-${rowIndex}`} style={{ display: 'flex' }}>
            {/* 第一行：序号 */}
            {row.dataIndex === 'number' ? (
              <td
                style={{
                  ...STYLE_PRINT.relationPrintTable_Tr_Th,
                  borderLeft: 'none',
                  padding: '5px',
                  width: `${maxNumberWidth}px`,
                  flexShrink: 0,
                }}
              >
                {_l('序号')}
              </td>
            ) : (
              <td style={{ ...STYLE_PRINT.relationPrintTable_Tr_Th, borderLeft: 'none', flexShrink: 0 }}>
                <BaseColumnHead
                  disableSort
                  className={`ant-table-cell ${row.className || ''}`}
                  style={{ width: maxNumberWidth || 'auto', padding: '5px' }}
                  control={row.control}
                  columnIndex={rowIndex}
                />
              </td>
            )}

            {/* 数据行 */}
            {dataSource.map((item, colIndex) => (
              <td
                style={{ ...STYLE_PRINT.relationPrintTable_Tr_Td, flexShrink: 0, width: itemTdWidth }}
                className="WordBreak"
                key={`print-col-${item.rowid}-${key}`}
              >
                {renderMap[key]?.(item[key], item, colIndex)}
              </td>
            ))}
          </tr>
        );
      })}
    </table>
  );
};

export default memo(TableRToC);
