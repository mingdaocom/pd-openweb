import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv, Tooltip } from 'ming-ui';
import CellControl from 'worksheet/components/CellControls';
import autoSize from 'ming-ui/decorators/autoSize';

const Wrap = styled.div(
  ({ width }) => `
  .tableCon {
    overflow: auto;
    width: 100%;
    .itemCon {
      flex-grow: 0;
      flex-shrink: 0;
      min-width: ${width > 200 ? width : 200}px;
      border: 1px solid rgba(0, 0, 0, 0.09) !important;
      border-left: none !important;
      border-top: none !important;
      padding: 0 16px;
      box-sizing: border-box;
      height: 35px;
      line-height: 35px;
      overflow: hidden;
    }
    .tag {
      max-width: 70px;
      min-width: 70px;
      border-left: 0;
    }
    .tableHeader {
      position: sticky;
      top: 0;
      .itemCon {
        background-color: #fafafa !important;
      }
    }
    .rowCon {
      .itemCon {
        border-top: 1px solid rgba(0, 0, 0, 0.09);
      }
    }
  }
`,
);

function Table(props) {
  const width = (props.width - 70) / props.controls.length;
  return (
    <Wrap className="h100" width={width}>
      <div className="tableCon flex">
        {props.controls.length > 0 && (
          <div className="tableHeader flexRow">
            <div className="tag flexRow alignItemsCenter itemCon InlineBlock"></div>
            {props.controls.map(control => {
              return (
                <div className="itemCon flex flexRow alignItemsCenter InlineBlock" width={width}>
                  {props.showIcon && control.icon && (
                    <Icon
                      icon={control.icon}
                      className="Font16 mRight5"
                      style={{ color: control.color || '#9e9e9e' }}
                    />
                  )}
                  <span className="ellipsis"> {control.controlName}</span>
                </div>
              );
            })}
          </div>
        )}
        {props.loading ? (
          <LoadDiv />
        ) : props.renderCon ? (
          props.renderCon()
        ) : (
          <React.Fragment>
            {props.data.map((o, i) => {
              return (
                <div className="rowCon flexRow">
                  <div className="tag flexRow alignItemsCenter itemCon InlineBlock">{i + 1}</div>
                  {props.controls.map(item => {
                    return (
                      <div className="itemCon flex" width={width}>
                        <CellControl
                          cell={{ ...item, value: o[item.controlId] }}
                          worksheetId={props.worksheetId}
                          row={{ rowid: o.rowid }}
                          isCharge={false}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        )}
      </div>
    </Wrap>
  );
}

export default autoSize(Table);
