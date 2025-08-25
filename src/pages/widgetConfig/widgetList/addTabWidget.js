import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';

const TAB_POSITION_TYPE = [
  { value: '2', text: _l('顶部'), img: require('/staticfiles/images/tab_top.png') },
  { value: '1', text: _l('底部'), img: require('/staticfiles/images/tab_bottom.png') },
  { value: '3', text: _l('左侧'), img: require('/staticfiles/images/tab_left.png') },
];

function AddTabWidget(props) {
  const { tabposition, handleOk } = props;
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState('2');

  useEffect(() => {
    setPosition(tabposition || '2');
  }, []);

  const imgSrc = _.get(
    _.find(TAB_POSITION_TYPE, i => i.value === position),
    'img',
  );

  return (
    <Dialog
      width={720}
      visible={visible}
      title={_l('添加标签页')}
      className="sectionConfirmDialog"
      okText={_l('添加')}
      footerLeftElement={() => (
        <div className="addTabWidgetLeftWrap">
          <div className="Gray_75 mRight12">{_l('标签页位置')}</div>
          <div className="tabPositionWrap">
            {TAB_POSITION_TYPE.map(item => {
              const active = item.value === position;
              return (
                <div
                  className={cx('tabPositionItem', { active })}
                  onClick={() => {
                    if (active) return;
                    setPosition(item.value);
                  }}
                >
                  {item.text}
                </div>
              );
            })}
          </div>
        </div>
      )}
      onCancel={() => setVisible(false)}
      onOk={() => handleOk(position, () => setVisible(false))}
    >
      <Fragment>
        <div className="Gray_75">{_l('使用标签页归类字段，保持页面简洁')}</div>
        <img src={imgSrc} height="100%" width="100%" />
      </Fragment>
    </Dialog>
  );
}

export default function addTabWidget(props) {
  return functionWrap(AddTabWidget, props);
}
