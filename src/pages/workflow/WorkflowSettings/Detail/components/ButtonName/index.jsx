import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Dialog, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';

const MessageBox = styled.div`
  height: 36px;
  background: #f5f5f5;
  border-radius: 4px;
  align-items: center;
  padding: 0 12px;
  .icon-trash:hover {
    color: #f44336 !important;
  }
`;

export default ({ buttons = [], data, updateSource }) => {
  const [visible, setVisible] = useState(false);
  const [cacheData, setCacheData] = useState({});
  const buttonNames = buttons.map(o => data[o.key]).filter(o => o);
  const generateData = (isEmpty = false) => {
    const obj = {};

    buttons.forEach(o => {
      obj[o.key] = isEmpty ? '' : data[o.key];
    });

    return obj;
  };

  return (
    <Fragment>
      <div className="Font13 bold mTop25">{_l('按钮名称')}</div>

      <MessageBox className="mTop10 flexRow">
        <div className="flex mRight20 ellipsis Font12">
          {!buttonNames.length ? (
            <span>{_l('系统默认')}</span>
          ) : (
            <span className="bold">{_l('自定义（%0）', buttonNames.join('、'))}</span>
          )}
        </div>

        {!!buttonNames.length && (
          <Tooltip title={_l('清空')}>
            <span className="mRight15">
              <Icon type="trash" className="Gray_75 Font14 pointer" onClick={() => updateSource(generateData(true))} />
            </span>
          </Tooltip>
        )}

        <Tooltip title={_l('编辑')}>
          <span>
            <Icon
              type="edit"
              className="Gray_75 ThemeHoverColor3 Font14 pointer"
              onClick={() => {
                setCacheData(generateData());
                setVisible(true);
              }}
            />
          </span>
        </Tooltip>
      </MessageBox>

      {visible && (
        <Dialog
          className="workflowDialogBox workflowSettings"
          style={{ overflow: 'initial' }}
          overlayClosable={false}
          type="scroll"
          visible
          title={_l('按钮名称')}
          onCancel={() => setVisible(false)}
          width={580}
          onOk={() => {
            updateSource(cacheData);
            setVisible(false);
          }}
        >
          {buttons.map((o, i) => (
            <Fragment key={i}>
              <div className={cx('Font13 Gray_75', { mTop20: i !== 0 })}>{o.title}</div>
              <div className="flexRow">
                <input
                  type="text"
                  className="flex ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mTop10"
                  placeholder={o.placeholder}
                  defaultValue={cacheData[o.key]}
                  onChange={evt => setCacheData({ ...cacheData, [o.key]: evt.currentTarget.value })}
                  onBlur={evt => setCacheData({ ...cacheData, [o.key]: evt.currentTarget.value.trim() })}
                />
              </div>
            </Fragment>
          ))}
        </Dialog>
      )}
    </Fragment>
  );
};
