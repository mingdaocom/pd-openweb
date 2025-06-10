import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog } from 'ming-ui';
import fixedDataAjax from 'src/api/fixedData.js';
import jobAjax from 'src/api/job';
import './dialogCreateAndEditRole.less';

class DialogCreateAndEditPosition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jobName: props.filed === 'edit' ? props.currentPosition.jobName : '',
    };
  }

  handleSubmit = () => {
    const { filed, positionList, projectId, currentPosition } = this.props;
    const { exsistCurrentName, submitLoading } = this.state;
    let jobName = this.state.jobName.trim();

    fixedDataAjax.checkSensitive({ content: jobName }).then(res => {
      if (res) {
        this.setState({ submitLoading: false });
        return alert(_l('输入内容包含敏感词，请重新填写'), 3);
      }
      if (filed === 'edit') {
        jobAjax
          .editJobName({ jobName: jobName, projectId, jobId: currentPosition.jobId })
          .then(res => {
            if (res) {
              alert(_l('修改成功'));
              let roleInfo = { ...currentPosition, jobName };
              this.props.updateCurrentPosition(roleInfo);
              let list = positionList.map(it => {
                if (it.jobId === currentPosition.jobId) {
                  return { ...it, jobName };
                }
                return it;
              });
              this.props.updatePositionList(list);
            } else {
              alert(_l('修改失败'), 2);
            }
            this.props.onCancel();
            this.setState({ submitLoading: false });
          })
          .catch(err => {
            this.setState({ submitLoading: false });
          });
      } else {
        jobAjax
          .addJob({ jobName: jobName, projectId })
          .then(res => {
            if (res) {
              alert(_l('创建成功'));
              let roleInfo = (positionList && !_.isEmpty(positionList) && positionList[0]) || {};
              this.props.updateCurrentPosition(roleInfo);
              this.props.getPositionList();
            } else {
              alert(_l('创建失败'), 2);
            }
            this.props.onCancel();
            this.setState({ submitLoading: false });
          })
          .catch(err => {
            this.setState({ submitLoading: false });
          });
      }
    });
  };

  footer = () => {
    const { filed, positionList, projectId, currentPosition } = this.props;
    const { exsistCurrentName, submitLoading } = this.state;
    let jobName = this.state.jobName.trim();

    return (
      <div className="createPositionDialogFooter">
        {filed === 'edit' ? (
          <span
            className="LineHeight20 Left mTop5 Hand deleteBtn"
            onClick={() => {
              jobAjax
                .deleteJobs({
                  jobIds: [currentPosition.jobId],
                  projectId,
                })
                .then(res => {
                  if (res) {
                    alert(_l('删除成功'));
                    this.props.getPositionList();
                    this.props.onCancel();
                  } else {
                    alert(_l('职位存在成员，无法删除'), 2);
                  }
                });
            }}
          >
            <i class="icon-task-new-delete Font16 mRight10"></i>
            <span>{_l('删除')}</span>
          </span>
        ) : (
          ''
        )}
        <span class="noText ThemeHoverColor3 Hand" onClick={() => this.props.onCancel()}>
          {_l('取消')}
        </span>
        <span
          class={cx('nyesText ', {
            ThemeBGColor3: !exsistCurrentName,
            boderRadAll_3: !exsistCurrentName,
            disabledComfrim: exsistCurrentName || submitLoading,
          })}
          onClick={() => {
            if (!jobName) {
              alert(_l('请输入职位名称'), 3);
              return;
            } else if (exsistCurrentName || submitLoading) {
              return;
            } else if (!!positionList.find(it => it.jobName === jobName)) {
              alert(_l('该职位名称已存在'), 3);
              this.setState({ exsistCurrentName: true });
              return;
            }

            this.setState({ submitLoading: true }, this.handleSubmit);
          }}
        >
          {_l('保存')}
        </span>
      </div>
    );
  };

  render() {
    const { filed, showRoleDialog } = this.props;
    const { jobName } = this.state;
    return (
      <Dialog
        title={filed === 'create' ? _l('新建职位') : _l('编辑职位')}
        footer={this.footer()}
        className="createPositionDialog"
        onCancel={() => this.props.onCancel()}
        visible={showRoleDialog}
      >
        <div>
          <div className="mTop5 mBottom12 Font14">{_l('职位名称')}</div>
          <input
            class="inputBox"
            maxLength={32}
            value={jobName}
            autoFocus
            placeholder={_l('请填写职位名称')}
            onChange={e => {
              this.setState({
                jobName: e.target.value,
                exsistCurrentName: false,
              });
            }}
          />
        </div>
      </Dialog>
    );
  }
}

export default DialogCreateAndEditPosition;
