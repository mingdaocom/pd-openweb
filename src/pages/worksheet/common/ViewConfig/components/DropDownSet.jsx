import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import AddControlDiaLog from 'src/pages/worksheet/common/ViewConfig/components/SelectStartOrEndControl/AddControlDiaLog';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { SYS } from 'src/utils/domain/control/widget';

const DropDownSetChoose = styled.div`
  position: relative;
  .Red {
    position: absolute;
    left: 10px;
    top: 8px;
  }
  .dropDropDownSet {
    width: 100%;
    &.isDelete {
      .hap-select-selection-item {
        opacity: 0;
        z-index: 1;
      }
    }
  }
  li {
    .itemText {
      padding-left: 10px;
    }
    &:hover {
      .itemText {
        color: var(--color-white);
      }
    }
  }
`;
// dropdown
export default class DropDownSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }
  render() {
    const {
      className,
      view,
      handleChange,
      txt,
      title,
      key,
      notFoundContent,
      controlList = [],
      addTxt,
      canAddControl,
      controls,
      addName,
      worksheetId,
      updateWorksheetControls,
      invalidValueText = _l('该字段已删除'),
    } = this.props;
    const { visible } = this.state;
    const setDataId = this.props.setDataId || _.get(view, ['advancedSetting', key]);
    let controlData = controlList.find(it => it.controlId === setDataId);
    let isDelete = setDataId && !controlData;
    return (
      <div className={className}>
        <div className="title Font13 bold">{title}</div>
        <div className="settingContent">
          <p className="mTop6 mBottom8 textSecondary viewSetText">{txt}</p>
          <DropDownSetChoose>
            <Select
              className={cx('dropDropDownSet', { isDelete })}
              optionLabelProp="label"
              placeholder={_l('请选择')}
              // 空值用 null 保持受控，避免“添加字段”操作被回显为选中项。
              value={setDataId || null}
              suffixIcon={<Icon icon="arrow-down-border Font14" />}
              allowClear
              classNames={{ popup: { root: 'dropConOption' } }}
              onChange={value => {
                if (value === setDataId) {
                  return;
                }

                if (value === 'add') {
                  this.setState({
                    visible: true,
                  });
                  return;
                }

                // Select 清空时返回 undefined，保存配置使用空字符串，避免请求序列化时丢失该字段。
                handleChange(value ?? '');
              }}
              notFoundContent={notFoundContent || _l('当前工作表中没有可选字段，请先去添加一个')}
              options={[
                ...controlList.map(item => {
                  const labelNode = (
                    <div className="">
                      <i className={cx('icon textTertiary mRight5 Font13', 'icon-' + getIconByType(item.type))}></i>
                      {item.controlName}
                    </div>
                  );
                  return {
                    value: item.controlId,
                    label: labelNode,
                    className: 'select_drop',
                  };
                }),
                canAddControl && {
                  value: 'add',
                  label: (
                    <React.Fragment>
                      <i className={cx('icon mRight12 Font16', 'icon-plus')}></i>
                      {addTxt}
                    </React.Fragment>
                  ),
                  className: 'addControl',
                },
              ].filter(Boolean)}
            />
            {isDelete && <span className="Red">{invalidValueText}</span>}
          </DropDownSetChoose>
        </div>
        {visible && (
          <AddControlDiaLog
            visible={visible}
            setVisible={() => {
              this.setState({
                visible: false,
              });
            }}
            type={36}
            controls={controls}
            onAdd={data => {
              let sys = controls.filter(o => SYS.includes(o.controlId));
              updateWorksheetControls(data.concat(sys));
            }}
            onChange={handleChange}
            addName={addName}
            title={_l('添加检查项字段')}
            enumType={'SWITCH'}
            worksheetId={worksheetId}
          />
        )}
      </div>
    );
  }
}
