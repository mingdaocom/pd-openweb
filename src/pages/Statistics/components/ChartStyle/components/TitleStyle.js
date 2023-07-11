import React, { useState, Fragment } from 'react';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import { Checkbox, Tooltip } from 'antd';

const Wrap = styled.div`
  .chartTypeSelect {
    &>div, .active {
      padding: 3px 8px !important;
    }
  }
  .lable {
    width: 80px;
  }
  .colorWrap {
    width: 32px;
    height: 32px;
    border-radius: 3px;
    padding: 4px;
    border: 1px solid #DDDDDD;
    background-color: #fff;

    .colorBlock {
      width: 100%;
      height: 100%;
    }
    .colorInput {
      width: 100%;
      height: 100%;
      opacity: 0;
    }
  }
`;

const alignTypes = [{
  value: 'left',
  icon: 'format_align_left',
  tooltip: _l('左对齐')
}, {
  value: 'center',
  icon: 'format_align_center',
  tooltip: _l('居中')
}, {
  value: 'right',
  icon: 'format_align_right',
  tooltip: _l('右对齐')
}];

export const defaultPivotTableStyle = {
  cellTextAlign: 'right',
  columnTextAlign: 'left',
  lineTextAlign: 'left',
  columnTextColor: '#757575',
  columnBgColor: '#fafafa',
  lineTextColor: '#333',
  lineBgColor: '#fff',
  evenBgColor: '#fafcfd',
  oddBgColor: 'transparent',
  textColor: '#000000d9'
};

const TitleStyle = props => {
  const { name, type, style, onChangeStyle } = props;
  const { pivotTableStyle = defaultPivotTableStyle } = style;
  const textColor = type === 'line' ? pivotTableStyle.lineTextColor : pivotTableStyle.columnTextColor;
  const bgColor = type === 'line' ? pivotTableStyle.lineBgColor : pivotTableStyle.columnBgColor;

  const handleChangePivotTableStyle = (data) => {
    onChangeStyle({
      pivotTableStyle: {
        ...pivotTableStyle,
        ...data,
      }
    });
  }

  const renderAlign = () => {
    const key = `${type}TextAlign`;
    return (
      <div className="flexRow valignWrapper mBottom12">
        <div className="lable">{_l('对齐方式')}</div>
        <div>
          <div className="chartTypeSelect flexRow valignWrapper">
            {alignTypes.map(item => (
              <Tooltip
                key={item.value}
                arrowPointAtCenter
                title={item.tooltip}
                placement="bottom"
              >
                <div
                  className={cx('flex centerAlign pointer Gray_75', { active: item.value === pivotTableStyle[key] })}
                  onClick={() => {
                    handleChangePivotTableStyle({
                      [key]: item.value
                    });
                  }}
                >
                  <Icon className="Font20" icon={item.icon} />
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Wrap className="mBottom16">
      {renderAlign()}
      {type === 'cell' ? (
        <Fragment>
          <div className="flexRow valignWrapper mBottom12">
            <div className="lable">{_l('颜色')}</div>
            <div className="flexRow valignWrapper">
              <div className="flex flexRow valignWrapper mRight10">
                {_l('奇行')}
                <div className="colorWrap mLeft5">
                  <div className="colorBlock" style={{ backgroundColor: pivotTableStyle.oddBgColor }}>
                    <input
                      type="color"
                      className="colorInput pointer"
                      value={pivotTableStyle.oddBgColor}
                      onChange={(event) => {
                        handleChangePivotTableStyle({
                          oddBgColor: event.target.value
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flexRow valignWrapper">
                {_l('偶行')}
                <div className="colorWrap mLeft5">
                  <div className="colorBlock" style={{ backgroundColor: pivotTableStyle.evenBgColor }}>
                    <input
                      type="color"
                      className="colorInput pointer"
                      value={pivotTableStyle.evenBgColor}
                      onChange={(event) => {
                        handleChangePivotTableStyle({
                          evenBgColor: event.target.value
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flexRow valignWrapper mBottom12">
            <div className="lable">{_l('文本颜色')}</div>
            <div className="colorWrap">
              <div className="colorBlock" style={{ backgroundColor: pivotTableStyle.textColor }}>
                <input
                  type="color"
                  className="colorInput pointer"
                  value={pivotTableStyle.textColor}
                  onChange={(event) => {
                    handleChangePivotTableStyle({
                      textColor: event.target.value
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="flexRow valignWrapper mBottom12">
            <div className="lable">{_l('文字')}</div>
            <div>
              <div className="colorWrap">
                <div className="colorBlock" style={{ backgroundColor: textColor }}>
                  <input
                    type="color"
                    className="colorInput pointer"
                    value={textColor}
                    onChange={(event) => {
                      if (type === 'line') {
                        handleChangePivotTableStyle({
                          lineTextColor: event.target.value
                        });
                      } else {
                        handleChangePivotTableStyle({
                          columnTextColor: event.target.value
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flexRow valignWrapper mBottom12">
            <div className="lable">{_l('背景色')}</div>
            <div>
              <div className="colorWrap">
                <div className="colorBlock" style={{ backgroundColor: bgColor }}>
                  <input
                    type="color"
                    className="colorInput pointer"
                    value={bgColor}
                    onChange={(event) => {
                      if (type === 'line') {
                        handleChangePivotTableStyle({
                          lineBgColor: event.target.value
                        });
                      } else {
                        handleChangePivotTableStyle({
                          columnBgColor: event.target.value
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flexRow valignWrapper mBottom12">
            <div className="lable">{_l('冻结%0标题', name)}</div>
            <div className="flexRow valignWrapper">
              <Checkbox
                checked={type === 'line' ? style.pivotTableLineFreeze : style.pivotTableColumnFreeze}
                onChange={event => {
                  const { checked } = event.target;
                  if (type === 'line') {
                    onChangeStyle({
                      pivotTableLineFreeze: checked
                    });
                  } else {
                    onChangeStyle({
                      pivotTableColumnFreeze: checked
                    });
                  }
                }}
              >
                {_l('PC')}
              </Checkbox>
              <Checkbox
                checked={type === 'line' ? style.mobilePivotTableLineFreeze : style.mobilePivotTableColumnFreeze}
                onChange={event => {
                  const { checked } = event.target;
                  if (type === 'line') {
                    onChangeStyle({
                      mobilePivotTableLineFreeze: checked
                    });
                  } else {
                    onChangeStyle({
                      mobilePivotTableColumnFreeze: checked
                    });
                  }
                }}
              >
                {_l('移动')}
              </Checkbox>
              <Tooltip title={_l('移动端屏幕尺寸较小，设置时请注意宽度和高度')} overlayStyle={{ width: 170 }} placement="bottomRight" arrowPointAtCenter>
                <Icon className="Gray_9e Font18 pointer" icon="knowledge-message" />
              </Tooltip>
            </div>
          </div>
        </Fragment>
      )}
    </Wrap>
  );
}

export default TitleStyle;
