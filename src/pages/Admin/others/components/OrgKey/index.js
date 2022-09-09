import React, { Component, Fragment } from 'react';
import { Icon, Dialog } from 'ming-ui';
import { Table, Dropdown, Menu } from 'antd';
import styled from 'styled-components';
import CreateEditKeyDialog from '../CreateEditKeyDialog';
import PasswordConfirm from '../PasswordConfirm';
import copy from 'copy-to-clipboard';
// import './index.less';
import cx from 'classnames';
import _ from 'lodash';

const OrgKeyWrap = styled.div`
  .addbtn {
    width: 80px;
    color: #2196f3;
  }
  .disabled {
    color: #9e9e9e;
    cursor: not-allowed;
  }
  .orgKeyList {
    .ant-table-thead {
      font-size: 13px;
      tr {
        th {
          background: #fff;
          color: #757575;
          padding: 18px 0;
          &:last-child {
            text-align: center;
          }
        }
      }
    }
    .ant-table-tbody {
      font-size: 13px;
      tr {
        td {
          padding: 18px 0;
        }
      }
    }
  }
`;

export default class OrgKey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createDialogVisible: false,
      checkVisible: false,
      passwordComfirmVisible: false,
      actType: '',
      columns: [
        { title: _l('AppKey'), dataIndex: 'appKey', ellipsis: true, width: 150 },
        { title: _l('接口权限'), dataIndex: 'interfacePermission', ellipsis: true },
        {
          title: _l('操作'),
          dataIndex: '操作',
          width: 100,
          render: (t, record) => {
            return (
              <div>
                <a className="mRight20" onClick={() => this.checkKey(record)}>
                  {_l('查看密钥')}
                </a>
                <Dropdown
                  trigger={['click']}
                  placement={['bottomRight']}
                  overlayClassName="moreAction"
                  overlay={
                    <Menu>
                      <Menu.Item
                        onClick={() => {
                          this.setState({ currentKeyInfo: record });
                          this.showCreateKeyDialog(true);
                        }}
                      >
                        <span>{_l('编辑')}</span>
                      </Menu.Item>
                      <Menu.Item onClick={() => this.deleteKey(record)}>
                        <span>{_l('删除')}</span>
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Icon icon="more_horiz" className="Hand" />
                </Dropdown>
              </div>
            );
          },
        },
      ],
      dataSource: [],
      appKey: 'b17dd754bb4c5ab7',
      secretKey: '1922a9da6e6614d35695e95d1bc5d52',
      sign: 'NDFiNGYxM2UzNDE4OGJlM2M4NGYwM2FjMmFiYjg4OGY5ZjkyNjNlZjI1NjNlMDE5ZWQxYzRhYzg2M2YyMjQ5Mw==',
      keyInfo: [
        { text: 'AppKey', key: 'appKey', canCheck: false },
        { text: 'SecretKey', key: 'secretKey', canCheck: true },
        { text: _l('Sign'), key: 'sign', canCheck: true },
      ],
    };
  }
  componentDidMount() {
    // let arr = [];
    // for (let i = 0; i <= 20; i++) {
    //   arr.push({ appKey: `b17dd754bb4c5ab71${i}`, interfacePermission: _l('人员组织接口；汇报关系接口') });
    // }
    // this.setState({ dataSource: arr });
  }
  // 查看
  checkKey = record => {
    this.setState({ checkVisible: true, currentKeyInfo: record });
  };
  clickCheckKeyInfo = (key, index) => {
    this.setState({ actType: 'check', passwordComfirmVisible: true });
  };
  // 新建/编辑
  showCreateKeyDialog = flag => {
    if (this.state.dataSource.length >= 20) return;
    this.setState({ createDialogVisible: !this.state.createDialogVisible, idEdit: flag });
  };
  // 删除
  deleteKey = record => {
    this.setState({ currentKeyInfo: record, actType: 'delete', passwordComfirmVisible: true });
  };
  cancelPasswordComfirm = () => {
    this.setState({ passwordComfirmVisible: false });
  };
  render() {
    let {
      createDialogVisible,
      idEdit,
      columns = [],
      dataSource = [],
      passwordComfirmVisible,
      actType,
      currentKeyInfo = {},
      checkVisible,
      keyInfo = [],
    } = this.state;
    return (
      <OrgKeyWrap>
        <div className="toolItem">
          <div className="toolItemLabel">{_l('组织密钥')}</div>
          <div className="toolItemRight">
            <div
              className={cx('addbtn Hand mTop20', { disabled: dataSource.length >= 20 })}
              onClick={this.showCreateKeyDialog}
            >
              <Icon icon="plus" className="mRight10" />
              {_l('新建密钥')}
            </div>
            {!_.isEmpty(dataSource) && (
              <Table className="orgKeyList" columns={columns} dataSource={dataSource} pagination={false} />
            )}
          </div>
        </div>
        <CreateEditKeyDialog
          visible={createDialogVisible}
          idEdit={idEdit}
          showCreateKeyDialog={this.showCreateKeyDialog}
          currentKeyInfo={currentKeyInfo}
        />
        <Dialog
          className="checkKeyDialog"
          visible={checkVisible}
          title={<span>{_l('查看密钥')}</span>}
          width={500}
          footer={null}
          overlayClosable={false}
          onCancel={() => {
            this.setState({ checkVisible: false });
          }}
        >
          <div className="keyBox">
            {keyInfo.map((item, index) => {
              return (
                <Fragment key={index}>
                  <div className={cx('keyLabel', { mTop24: index !== 0 })}>{item.text}</div>
                  <div className="subLabel flexRow mTop5">
                    {!item.canCheck ? (
                      <a className="ThemeColor" onClick={() => this.clickCheckKeyInfo(item.key, index)}>
                        {_l('查看')}
                      </a>
                    ) : (
                      <div className="Gray_75 breakAll">
                        {this.state[item.key]}
                        <span
                          className="ThemeColor ThemeHoverColor2 mLeft10 pointer"
                          style={{ whiteSpace: 'nowrap' }}
                          onClick={() => {
                            copy(this.state[item.key]);
                            alert(_l('已复制到剪切板'));
                          }}
                        >
                          {_l('复制')}
                        </span>
                      </div>
                    )}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </Dialog>
        <PasswordConfirm
          visible={passwordComfirmVisible}
          actType={actType}
          cancelPasswordComfirm={this.cancelPasswordComfirm}
        />
      </OrgKeyWrap>
    );
  }
}
