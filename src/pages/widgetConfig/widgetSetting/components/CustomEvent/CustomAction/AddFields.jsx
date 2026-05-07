import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Icon } from 'ming-ui';
import { DEFAULT_CONFIG, SYS, SYS_CONTROLS } from '../../../../config/widget';
import { DropdownOverlay } from '../../../../styled';
import { enumWidgetType } from '../../../../util';
import { DynamicBtn } from '../style';

export default function AddFields(props) {
  const { handleClick, selectControls, text, disabled, showSys = false } = props;
  const filterControls = showSys
    ? selectControls
    : selectControls.filter(i => !_.includes(SYS_CONTROLS.concat(SYS), i.controlId));
  const [visible, setVisible] = useState(false);
  const [searchValue, setValue] = useState('');
  const triggerRef = useRef(null);
  const $ref = useRef(null);

  const filterData = searchValue
    ? filterControls.filter(item => item.controlName.includes(searchValue))
    : filterControls;

  const onItemClick = item => {
    handleClick(item);
    // 列表变长后按钮会下移，下一帧重新对齐下拉位置
    requestAnimationFrame(() => {
      if ($ref.current) {
        $ref.current.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      }

      requestAnimationFrame(() => {
        triggerRef.current?.forcePopupAlign?.();
      });
    });
  };

  useEffect(() => {
    if (disabled && visible) {
      setVisible(false);
    }
  }, [disabled]);

  return (
    <Trigger
      ref={triggerRef}
      popup={() => {
        return (
          <DropdownOverlay>
            <div className="searchWrap" onClick={e => e.stopPropagation()}>
              <i className="icon-search Font16 textSecondary"></i>
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
                    <div className="item overflow_ellipsis" onClick={() => onItemClick(i)}>
                      <Icon icon={icon} className="Font15" />
                      <span className="overflow_ellipsis" title={i.controlName}>
                        {i.controlName}
                      </span>
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
      zIndex={1060}
    >
      <DynamicBtn className={cx(props.className, { disabled })} ref={$ref}>
        <Icon icon="add" className="Bold" />
        {text || _l('字段')}
      </DynamicBtn>
    </Trigger>
  );
}
