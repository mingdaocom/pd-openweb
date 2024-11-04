import React, { Component, Fragment } from 'react';
import { Icon, Input, SvgIcon } from 'ming-ui';
import AddAppListDialog from './AddAppListDialog';
import dataLimitAjax from 'src/api/dataLimit';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';

const ContentWrap = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  .content {
    overflow-y: auto;
  }
  .limitWrap {
    height: 40px;
    line-height: 40px;
    background: #f6fafe;
    border-radius: 3px;
    padding-left: 12px;
    margin-bottom: 24px;
  }
  input {
    width: 120px;
    &.overLimit {
      border: 1px solid #f44336;
    }
  }
  .appName {
    width: 262px;
  }
  .appIcon {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    margin-right: 8px;
    text-align: center;
  }
  .size {
    margin-right: 70px;
  }

  .footer {
    height: 66px;
    padding: 15px 0;
    background-color: #fff;
  }
  .saveBtn,
  .delBtn {
    height: 36px;
    line-height: 36px;
    padding: 0 30px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: color ease-in 0.2s, border-color ease-in 0.2s, background-color ease-in 0;
  }

  .saveBtn {
    margin-right: 20px;
    background: #1e88e5;
    color: #fff;
    &:hover {
      background: #1565c0;
    }
    &.disabled {
      color: #fff;
      background: #b2dbff;
      cursor: not-allowed;
      &:hover {
        background: #b2dbff;
      }
    }
  }
  .delBtn {
    border: 1px solid #eaeaea;
    &:hover {
      border: 1px solid #ccc;
    }
    &.disabled {
      color: #eaeaea;
      cursor: not-allowed;
      &:hover {
        border: 1px solid #eaeaea;
      }
    }
  }
`;

export default class LimitAttachmentUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLimits: [],
      limits: [],
      size: undefined,
      loading: true,
    };
  }

  componentDidMount() {
    this.getLimits();
  }

  getLimits = () => {
    const { projectId } = this.props;

    this.setState({ loading: true });

    dataLimitAjax
      .getLimits({ projectId })
      .then(({ size, limits = [] }) => {
        this.setState({
          size: size === 0 ? undefined : size,
          limits,
          initialLimits: limits,
          initialSize: size === 0 ? undefined : size,
          loading: false,
        });
      })
      .catch(err => {
        this.setState({ size: 0, limits: [], loading: false });
      });
  };

  handleAddAppList = data => {
    const { limits, size } = this.state;
    const temp = data
      .filter(
        item =>
          !_.includes(
            limits.map(v => v.entityId),
            item.entityId,
          ),
      )
      .map(item => ({ ...item, size }));

    this.setState({ limits: limits.concat(temp), showAddAppList: false });
  };

  changeItemSize = (val, item) => {
    const limits = _.clone(this.state.limits);
    const index = _.findIndex(limits, v => v.entityId === item.entityId);
    limits[index] = { ...limits[index], size: val };

    this.setState({ limits });
  };

  remove = entityId => {
    const { limits } = this.state;
    this.setState({ limits: limits.filter(v => v.entityId !== entityId) });
  };

  onSave = () => {
    const { projectId } = this.props;
    const { limits, size, initialLimits, initialSize, loading } = this.state;
    const limitSize = md.global.SysSettings.fileUploadLimitSize || 4 * 1024;

    if (loading || !limits || (_.isEqual(initialLimits, limits) && _.isEqual(size, initialSize))) return;

    if (size > limitSize || _.findIndex(limits, v => v.size > limitSize) > -1) {
      this.setState({ clickSubmit: true });
      return alert(_l('保存失败，超出上限'), 2);
    } else {
      this.setState({ clickSubmit: false });
    }

    this.setState({ loading: true });
    dataLimitAjax
      .editLimits({ projectId, limits: limits.map(v => ({ ...v, size: v.size || 0 })), size: size || 0 })
      .then(res => {
        if (res) {
          alert(_l('保存成功'));
          this.setState({ initialLimits: limits, initialSize: size });
        } else {
          alert(_l('保存失败'), 2);
        }
        this.setState({ loading: false });
      })
      .catch(err => {
        alert(_l('保存失败'), 2);
        this.setState({ loading: false });
      });
  };

  onBlur = (e, callback) => {
    let val = e.target.value;
    if (val === '0') {
      return callback(1);
    }
    val = val.replace(/^[0]+/, '');

    callback(val);
  };

  render() {
    const { projectId, onClose = () => {} } = this.props;
    const { size, limits, initialLimits, initialSize, showAddAppList, loading, clickSubmit } = this.state;
    const limitSize = md.global.SysSettings.fileUploadLimitSize || 4 * 1024;
    const disabled = !limits || (_.isEqual(initialLimits, limits) && _.isEqual(size, initialSize));

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader">
          <div className="flexRow alignItemsCenter">
            <Icon icon="backspace" className="Font22 ThemeHoverColor3 pointer" onClick={onClose} />
            <div className="Font17 bold flex mLeft10">{_l('单附件上传')}</div>
          </div>
        </div>
        <ContentWrap className="orgManagementContent">
          <div className="content flex">
            <div className="limitWrap">
              {_l(
                '系统支持的附件大小上限为 %0，可设置组织下允许的附件大小上限',
                `${md.global.Config.IsLocal ? limitSize + 'M' : '4G'}`,
              )}
            </div>
            <div className="Font15 bold mBottom12">{_l('全局配置')}</div>
            <div className="flexRow alignItemsCenter mBottom24">
              <div>{_l('单个附件大小')}</div>
              <Input
                className={cx('mLeft10 mRight10', { overLimit: clickSubmit && size > limitSize })}
                value={size}
                onChange={val => this.setState({ size: val.replace(/\D/g, '') })}
                onBlur={e => this.onBlur(e, val => this.setState({ size: val }))}
              />
              <div>M</div>
            </div>
            <div className="Font15 bold mBottom12">{_l('额外配置')}</div>
            <span
              className="ThemeColor Hand bold mBottom16 InlineBlock"
              onClick={() => this.setState({ showAddAppList: true })}
            >
              <Icon icon="plus" />
              <span>{_l('添加应用')}</span>
            </span>
            {_.isEmpty(limits) ? (
              ''
            ) : (
              <Fragment>
                <div className="flexRow Gray_9e Font12 mBottom16">
                  <div className="appName">{_l('应用名称')}</div>
                  <div className="size">{_l('单个附件大小')}</div>
                </div>
                {limits.map(item => {
                  const { name, color, iconUrl, entityId } = item;

                  return (
                    <div key={entityId} className="flexRow alignItemsCenter mBottom16">
                      <div className="appName flexRow alignItemsCenter">
                        <div className="appIcon" style={{ background: color }}>
                          <SvgIcon url={iconUrl} fill="#fff" size={18} className="mTop3" />
                        </div>
                        <span className="flex ellipsis mRight10" title={name}>
                          {name}
                        </span>
                      </div>
                      <div className="size flexRow alignItemsCenter">
                        <Input
                          className={cx('mRight10', { overLimit: clickSubmit && item.size > limitSize })}
                          value={item.size}
                          onChange={val => this.changeItemSize(val.replace(/\D/g, ''), item)}
                          onBlur={e => this.onBlur(e, val => this.changeItemSize(val, item))}
                        />
                        <div>M</div>
                      </div>
                      <div className="Gray_bd Hand Hover_21" onClick={() => this.remove(entityId)}>
                        {_l('移除')}
                      </div>
                    </div>
                  );
                })}
              </Fragment>
            )}
          </div>

          <div className="footer flexRow">
            <div className={cx('saveBtn', { disabled: loading || disabled })} onClick={this.onSave}>
              {_l('保存')}
            </div>
            <div
              className={cx('delBtn', { disabled: loading || disabled })}
              onClick={() => this.setState({ limits: initialLimits, size: initialSize })}
            >
              {_l('取消')}
            </div>
          </div>

          {showAddAppList && (
            <AddAppListDialog
              visible={showAddAppList}
              projectId={projectId}
              onOk={this.handleAddAppList}
              onCancel={() => this.setState({ showAddAppList: false })}
            />
          )}
        </ContentWrap>
      </div>
    );
  }
}
