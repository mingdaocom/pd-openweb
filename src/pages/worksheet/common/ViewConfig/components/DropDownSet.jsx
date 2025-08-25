import React from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import { getIconByType } from 'src/pages/widgetConfig/util';
import AddControlDiaLog from 'src/pages/worksheet/common/ViewConfig/components/SelectStartOrEndControl/AddControlDiaLog';

const DropDownSetChoose = styled.div`
  position: relative;
  .Red {
    position: absolute;
    left: 10px;
    top: 8px;
  }
   {
    .dropDropDownSet {
      width: 100%;
      .ant-select-selector {
        border-radius: 3px !important;
        height: 36px !important;
        .ant-select-selection-item {
          line-height: 36px !important;
          font-size: 13px !important;
        }
      }
      &.isDelete {
        .ant-select-selector {
          border-color: red !important;
        }
        .ant-select-selection-item {
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
          color: #fff;
        }
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
    } = this.props;
    const { visible } = this.state;
    const setDataId = this.props.setDataId || _.get(view, ['advancedSetting', key]);
    let controlData = controlList.find(it => it.controlId === setDataId);
    let isDelete = setDataId && !controlData;
    return (
      <div className={className}>
        <div className="title Font13 bold">{title}</div>
        <div className="settingContent">
          <p className="mTop6 mBottom8 Gray_75 viewSetText">{txt}</p>
          <DropDownSetChoose>
            <Select
              className={cx('dropDropDownSet', { isDelete })}
              optionLabelProp="label"
              placeholder={_l('请选择')}
              value={[setDataId]}
              suffixIcon={<Icon icon="arrow-down-border Font14" />}
              allowClear={setDataId}
              dropdownClassName="dropConOption"
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
                handleChange(value);
              }}
              notFoundContent={notFoundContent || _l('当前工作表中没有可选字段，请先去添加一个')}
            >
              {controlList.map((item, i) => {
                const labelNode = (
                  <div className="">
                    <i className={cx('icon Gray_9e mRight5 Font13', 'icon-' + getIconByType(item.type))}></i>
                    {item.controlName}
                  </div>
                );
                return (
                  <Select.Option value={item.controlId} key={i} label={labelNode} className="select_drop">
                    {labelNode}
                  </Select.Option>
                );
              })}
              {canAddControl && (
                <Select.Option className="addControl" value={'add'}>
                  <i className={cx('icon mRight12 Font16', 'icon-plus')}></i>
                  {addTxt}
                </Select.Option>
              )}
            </Select>
            {isDelete && <span className="Red">{_l('该字段已删除')}</span>}
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
