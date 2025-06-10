import React from 'react';
import styled from 'styled-components';
import { Dropdown } from 'ming-ui';
import { AS_ABSTRACT_CONTROL, filterAndFormatterControls } from 'src/pages/worksheet/views/util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import cx from 'classnames';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import _ from 'lodash';
import NumInput from './NumInput';

const MaxLineWrap = styled.div`
  justify-content: space-between;
  .maxLine {
    width: 300px;
  }
`;

// 摘要
export default class Abstract extends React.Component {
  render() {
    const { worksheetControls = [], advancedSetting = {}, handleChange } = this.props;
    const { abstract, maxlinenum = 3 } = advancedSetting;
    let abstractControls = filterAndFormatterControls({
      controls: worksheetControls.filter(
        item =>
          !SYS.includes(item.controlId) && // 排除系统字段
          !((_.includes([48], item.sourceControlType) || item.strDefault === '10') && item.type === 30), //排除他表字段 组织角色控件
      ),
      filter: item => _.includes(AS_ABSTRACT_CONTROL, (item.type === 30 ? item.sourceControlType : item.type)),
    });
    abstractControls = abstractControls.map(it => {
      return {
        ...it,
        iconName: getIconByType((worksheetControls.find(item => item.controlId === it.value) || {}).type, false),
      };
    });
    const isExistAbstract = !!worksheetControls.filter(item => item.controlId === abstract).length;

    return (
      <React.Fragment>
        <div className="title Font13 bold">{_l('摘要')}</div>
        <div className="settingContent">
          <p className="mTop6 mBottom8 Gray_75 viewSetText Font13">{_l('用于显示长文本，最多可显示5行')}</p>
          <Dropdown
            className={cx('dropAbstract', { placeholder: !abstract || !isExistAbstract })}
            data={abstractControls}
            value={isExistAbstract ? abstract : ''}
            border
            openSearch
            cancelAble={!!(isExistAbstract ? abstract : '')}
            maxHeight={260}
            style={{ width: '100%' }}
            onChange={value => {
              if (value === abstract) {
                return;
              }

              handleChange({ abstract: value || '' });
            }}
            placeholder={_l('请选择')}
          />
          {isExistAbstract && (
            <MaxLineWrap className="valignWrapper mTop10">
              <span>{_l('最大显示行数')}</span>
              <NumInput
                className="maxLine"
                minNum={1}
                maxNum={5}
                value={Number(maxlinenum)}
                onChange={value => handleChange({ maxlinenum: value })}
              />
            </MaxLineWrap>
          )}
        </div>
      </React.Fragment>
    );
  }
}
