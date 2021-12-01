import React from 'react';
import { Icon } from 'ming-ui';
import { Select } from 'antd';
import { getIconByType } from 'src/pages/widgetConfig/util';
import cx from 'classnames';
import styled from 'styled-components';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import AddControlDiaLog from 'src/pages/worksheet/common/ViewConfig/components/SelectStartOrEndControl/AddControlDiaLog';
const DropDownSetChoose = styled.div`
   {
    .dropDropDownSet {
      width: 100%;
      .ant-select-selector {
        border-radius: 3px !important;
        height: 36px !important;
        .ant-select-selection-item {
          line-height: 36px !important;
        }
      }
      &.isDelete {
        .ant-select-selector {
          border-color: red !important;
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
      worksheetControls = [],
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
    let controlData = controlList.find(it => it.controlId === setDataId) || {};
    let isDelete = setDataId && !worksheetControls.find(it => it.controlId === setDataId);
    return (
      <React.Fragment>
        <div className="title Font13 bold mTop32">{title}</div>
        <div className="settingContent">
          <p className="mTop6 mBottom8 Gray_9e viewSetText">{txt}</p>
          <DropDownSetChoose>
            <Select
              className={cx('dropDropDownSet', { isDelete })}
              value={
                setDataId ? (
                  isDelete ? (
                    <span className="Red">{_l('该字段已删除')}</span>
                  ) : (
                    <span className="Gray">
                      <i className={cx('icon Gray_9e mRight5 Font14', 'icon-' + getIconByType(controlData.type))}></i>
                      {controlData.controlName}
                    </span>
                  )
                ) : (
                  <span className="Gray_bd">{_l('请选择')}</span>
                )
              }
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
                return (
                  <Select.Option value={item.controlId} key={i}>
                    <i className={cx('icon Gray_9e mRight5 Font14', 'icon-' + getIconByType(item.type))}></i>
                    {item.controlName}
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
            title={_l('添加日期字段')}
            withoutIntro={true}
            enumType={'DATE'}
            worksheetId={worksheetId}
          />
        )}
      </React.Fragment>
    );
  }
}
