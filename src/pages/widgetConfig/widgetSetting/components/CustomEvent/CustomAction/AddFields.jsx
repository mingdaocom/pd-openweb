import React, { useEffect, useState } from 'react';
import { Icon } from 'ming-ui';
import Trigger from 'rc-trigger';
import { enumWidgetType } from '../../../../util';
import { DEFAULT_CONFIG, SYS, SYS_CONTROLS } from '../../../../config/widget';
import { DynamicBtn } from '../style';
import { DropdownOverlay } from '../../../../styled';
import cx from 'classnames';

export default function AddFields(props) {
  const { handleClick, selectControls, text, disabled, showSys = false } = props;
  const filterControls = showSys
    ? selectControls
    : selectControls.filter(i => !_.includes(SYS_CONTROLS.concat(SYS), i.controlId));
  const [visible, setVisible] = useState(false);
  const [searchValue, setValue] = useState('');

  const filterData = searchValue
    ? filterControls.filter(item => item.controlName.includes(searchValue))
    : filterControls;

  useEffect(() => {
    if (disabled && visible) {
      setVisible(false);
    }
  }, [disabled]);

  return (
    <Trigger
      popup={() => {
        return (
          <DropdownOverlay>
            <div className="searchWrap" onClick={e => e.stopPropagation()}>
              <i className="icon-search Font16 Gray_75"></i>
              <input
                autoFocus
                value={searchValue}
                placeholder={_l('搜索')}
                onChange={e => {
                  setValue(e.target.value);
                }}
              />
            </div>

            <div className="dropdownContent">
              {filterData.length > 0 ? (
                filterData.map(i => {
                  const enumType = enumWidgetType[i.type];
                  const { icon } = DEFAULT_CONFIG[enumType];
                  return (
                    <div className="item overflow_ellipsis" onClick={() => handleClick(i)}>
                      <Icon icon={icon} className="Font15" />
                      <span className="overflow_ellipsis">{i.controlName}</span>
                    </div>
                  );
                })
              ) : (
                <div className="emptyText">{_l(searchValue ? '暂无搜索结果' : '无内容')}</div>
              )}
            </div>
          </DropdownOverlay>
        );
      }}
      popupVisible={visible}
      onPopupVisibleChange={visible => {
        if (disabled) return;
        setVisible(visible);
        if (!visible) {
          setValue('');
        }
      }}
      action={['click']}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [0, 5],
        overflow: { adjustX: true, adjustY: true },
      }}
      getPopupContainer={() => document.body}
    >
      <DynamicBtn className={cx(props.className, { disabled })}>
        <Icon icon="add" className="Bold" />
        {text || _l('字段')}
      </DynamicBtn>
    </Trigger>
  );
}
