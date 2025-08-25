import React from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import CellControl from 'worksheet/components/CellControls';

const Wrap = styled.div(
  ({ width }) => `
  .tableCon {
    border-top: 1px solid #f1f1f1;
    overflow: auto;
    width: 100%;
    .itemCon {
      flex-grow: 0;
      flex-shrink: 0;
      min-width: ${width > 200 ? width : 200}px;
      border: 1px solid rgba(0, 0, 0, 0.09) !important;
      border-left: none !important;
      border-top: none !important;
      padding: 0 5px;
      box-sizing: border-box;
      height: 35px;
      line-height: 35px;
      overflow: hidden;
      font-weight: bold;
      font-size: 13px;
      color: #757575;
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
      .emptyForResize {
        width: 60px !important;
        min-width: 60px !important;
        max-width: 60px !important;
        border-color: transparent !important;
        background: #fff !important;
      }
    }
    .rowCon {
      .itemCon {
        border-top: 1px solid rgba(0, 0, 0, 0.09);
      }
    }
    .colorCon {
      top: 8px;
      width: 2px;
      height: 18px;
      position: absolute;
      left: 0;
      border-radius: 2px;
    }
  }
`,
);

function Table(props) {
  // const width = (props.width - 60 - 70) / props.controls.length;
  const width = (props.width - 70) / props.controls.length;
  return (
    <Wrap className="h100 flex flexColumn alignItemsCenter" width={width}>
      <div className="tableCon flex">
        {props.controls.length > 0 && (
          <div className="tableHeader flexRow">
            <div className="tag flexRow alignItemsCenter itemCon InlineBlock"></div>
            {props.controls.map(control => {
              return (
                <div className="itemCon flex flexRow alignItemsCenter Relative" width={width}>
                  {props.showIcon && control.icon && (
                    <React.Fragment>
                      {control.color && <div className="colorCon" style={{ backgroundColor: control.color }}></div>}
                      <Icon
                        icon={control.icon}
                        className="Font16 mRight5"
                        style={{ color: control.color || '#9e9e9e' }}
                      />
                    </React.Fragment>
                  )}
                  <span className="ellipsis flex"> {control.controlName}</span>
                </div>
              );
            })}
            {/* <div className="itemCon flex flexRow alignItemsCenter InlineBlock emptyForResize" width={60} /> */}
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
                  {/* <div className="flexRow alignItemsCenter itemCon InlineBlock emptyForResize" width={60} /> */}
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
