import React, { memo } from 'react';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import STYLE_PRINT from '../../core/exportWordPrintTemCssString';

const TableCommon = ({ list = [], dataSource = [], id, tableProps, resizeWidth }) => {
  return (
    <table className="printRelationTable" {...tableProps}>
      <tr>
        {list.map((item, index) => {
          const borderLeftNone = index === 0 ? { borderLeft: 'none' } : {};
          return item.dataIndex === 'number' ? (
            <td
              key="print-relation-header-td-number"
              style={{
                width: item.width,
                minWidth: item.width,
                ...STYLE_PRINT.relationPrintTable_Tr_Th,
                ...borderLeftNone,
                padding: '5px',
              }}
            >
              {_l('序号')}
            </td>
          ) : (
            <td
              key={`print-relation-header-td-${item.controlId}`}
              style={{ ...STYLE_PRINT.relationPrintTable_Tr_Th, ...borderLeftNone, width: item.width }}
            >
              <BaseColumnHead
                disableSort={true}
                className={`ant-table-cell ${item.className}`}
                style={{ width: item.width, padding: '5px' }}
                control={item.control}
                columnIndex={index}
                updateSheetColumnWidths={({ controlId, value }) => {
                  console.log('controlId', controlId, value);
                  resizeWidth(controlId, value);
                }}
              />
            </td>
          );
        })}
      </tr>
      {dataSource.map((item, i) => {
        return (
          <tr key={`print-relation-tr-${id}-${item.rowid}`}>
            {list.map((column, index) => {
              const borderLeftNone = index === 0 ? { borderLeft: 'none' } : {};

              return (
                <td
                  style={{
                    width: column.width,
                    ...STYLE_PRINT.relationPrintTable_Tr_Td,
                    ...borderLeftNone,
                    borderBottomColor: index + 1 === column.length ? '#000' : 'var(--color-border-primary)',
                  }}
                  className="WordBreak"
                  key={`print-relation-tr-${id}-${item.rowid}-${column.controlId}`}
                >
                  {column.render(item[column.dataIndex], item, i)}
                </td>
              );
            })}
          </tr>
        );
      })}
    </table>
  );
};

export default memo(TableCommon);
