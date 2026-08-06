import React, { memo } from 'react';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import { BASE_PRINT_CONTENT_WIDTH } from '../../core/config';
import STYLE_PRINT from '../../core/exportWordPrintTemCssString';

// 行转列
const TableRToC = ({
  list = [],
  dataSource = [],
  tableProps,
  placeholderMode,
  contentWidth = BASE_PRINT_CONTENT_WIDTH,
}) => {
  const renderMap = list.reduce((acc, item) => {
    acc[item.dataIndex === 'number' ? 'number' : item.controlId] = item.render;
    return acc;
  }, {});
  const max = list.reduce((m, { width = 0 }) => Math.max(m, width), 0);
  const firstColumnMaxWidth = Math.min(320, Math.max(Math.floor(contentWidth * 0.4), 120));
  const firstColumnWidth = Math.min(Math.max(max, 120), firstColumnMaxWidth);
  const firstColumnStyle = {
    width: `${firstColumnWidth}px`,
    minWidth: `${firstColumnWidth}px`,
    flex: `0 0 ${firstColumnWidth}px`,
  };

  return (
    <table className="printRelationTable tableRtoC" {...tableProps}>
      {list.map((row, rowIndex) => {
        const key = row.dataIndex === 'number' ? 'number' : row.controlId;

        return (
          <tr key={`row-${rowIndex}`} style={{ display: 'flex', width: '100%' }}>
            {/* 第一行：序号 */}
            {row.dataIndex === 'number' ? (
              <td
                style={{
                  ...STYLE_PRINT.relationPrintTable_Tr_Th,
                  borderLeft: 'none',
                  padding: '5px',
                  ...firstColumnStyle,
                }}
              >
                {_l('序号')}
              </td>
            ) : (
              <td
                style={{
                  ...STYLE_PRINT.relationPrintTable_Tr_Th,
                  borderLeft: 'none',
                  ...firstColumnStyle,
                }}
              >
                <BaseColumnHead
                  hideMaskIcon
                  disableSort
                  className={`ant-table-cell ${row.className || ''}`}
                  style={{ width: '100%', padding: '5px' }}
                  control={row.control}
                  columnIndex={rowIndex}
                />
              </td>
            )}

            {/* 数据行 */}
            {dataSource.map((item, colIndex) => (
              <td
                style={{
                  ...STYLE_PRINT.relationPrintTable_Tr_Td,
                  flex: '1 1 0',
                  minWidth: 0,
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                }}
                className="WordBreak"
                key={`print-col-${item.rowid}-${key}`}
              >
                {renderMap[key]?.(item[key], item, colIndex) || placeholderMode}
              </td>
            ))}
          </tr>
        );
      })}
    </table>
  );
};

export default memo(TableRToC);
