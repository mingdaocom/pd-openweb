import React from 'react';
import { Dialog } from 'ming-ui';
import styled from 'styled-components';
import _ from 'lodash';
import { useSetState } from 'react-use';
import { defaultDoubleConfirm } from './config';

const Wrap = styled.div`
  .line {
    border-top: 1px solid #eaeaea;
    margin: 24px 0;
  }
  .btnTxt {
    input {
      flex: 1;
    }
    span {
      width: 80px;
    }
  }
  .icon-ic_toggle_off {
    color: #bdbdbd;
  }
  .icon-ic_toggle_on {
    color: #00c345;
  }
  .bold400 {
    font-weight: 400;
  }
  .remarkWrap {
    background: #f8f8f8;
    border-radius: 3px 3px 3px 3px;
    border: 1px solid #dddddd;
    line-height: 36px;
    padding: 0 12px;
  }
  .borderTop {
    border-top: 1px solid #eaeaea;
    margin-top: 24px;
    padding-top: 24px;
  }
`;

export default function DoubleConfirmationDialog(props) {
  const { onCancel, visible, onChange } = props;
  const [{ doubleConfirm }, setState] = useSetState({
    doubleConfirm: _.isEmpty(props.doubleConfirm) ? defaultDoubleConfirm : props.doubleConfirm,
  });
  return (
    <Dialog
      title={_l('确认层设置')}
      okText={_l('保存')}
      cancelText={_l('取消')}
      className="doubleConfirmDialog"
      width="560px"
      onCancel={onCancel}
      onOk={() => {
        const { confirmMsg = '', sureName = '', cancelName = '', confirmContent = '' } = doubleConfirm;
        onChange({
          confirmMsg: confirmMsg.trim() || _.get(props, 'doubleConfirm.confirmMsg') || defaultDoubleConfirm.confirmMsg,
          sureName: sureName.trim() || _.get(props, 'doubleConfirm.sureName') || defaultDoubleConfirm.sureName,
          cancelName: cancelName.trim() || _.get(props, 'doubleConfirm.cancelName') || defaultDoubleConfirm.cancelName,
          confirmContent: confirmContent.trim(),
        });
      }}
      visible={visible}
    >
      <Wrap>
        <h5 className="Bold Font14">{_l('提示信息')}</h5>
        <p className="Bold mTop30">{_l('标题')}</p>
        <input
          className="mTop10"
          value={_.get(doubleConfirm, 'confirmMsg')}
          onChange={event => {
            setState({
              doubleConfirm: {
                ...doubleConfirm,
                confirmMsg: event.target.value,
              },
            });
          }}
        />
        <p className="mTop24 bold">{_l('详细内容')}</p>
        <input
          className="mTop10"
          value={doubleConfirm.confirmContent}
          onChange={event => {
            setState({
              doubleConfirm: {
                ...doubleConfirm,
                confirmContent: event.target.value,
              },
            });
          }}
        />
        <h5 className="Bold Font14 borderTop ">{_l('按钮文案')}</h5>
        <div className="flexRow btnTxt alignItemsCenter mTop10">
          <span className="bold400">{_l('确认按钮')}</span>
          <input
            value={_.get(doubleConfirm, 'sureName')}
            onChange={event => {
              setState({
                doubleConfirm: {
                  ...doubleConfirm,
                  sureName: event.target.value,
                },
              });
            }}
          />
        </div>
        <div className="flexRow btnTxt alignItemsCenter mTop10">
          <span className="bold400">{_l('取消按钮')}</span>
          <input
            value={_.get(doubleConfirm, 'cancelName')}
            onChange={event => {
              setState({
                doubleConfirm: {
                  ...doubleConfirm,
                  cancelName: event.target.value,
                },
              });
            }}
          />
        </div>
      </Wrap>
    </Dialog>
  );
}
