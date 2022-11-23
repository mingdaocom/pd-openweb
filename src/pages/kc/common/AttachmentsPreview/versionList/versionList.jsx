import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { LoadDiv } from 'ming-ui';
const kcAjax = require('src/api/kc');
import { downloadFile } from 'src/util';

class VersionList extends React.Component {
  static propTypes() {
    return {
      attachment: PropTypes.object,
      callback: PropTypes.func,
      download: PropTypes.func,
      performRemoveItems: PropTypes.func,
      replaceAttachment: PropTypes.func,
      onClose: PropTypes.func,
    };
  }

  state = {
    versionList: null,
    activeVersionId: this.props.attachment.versionId || '',
  };

  componentDidMount() {
    this.fetchList();
  }

  fetchList = () => {
    const comp = this;
    kcAjax
      .getMultiVersionFile({
        id: this.props.attachment.id,
      })
      .then(list => {
        comp.setState({
          versionList: list.sort((a, b) => a.createTime < b.createTime),
        });
      });
  };

  changeVersion = version => {
    const versionId = version.versionId ? version.versionId : '';
    if (version.versionId === this.state.activeVersionId) {
      return;
    }
    this.setState({
      activeVersionId: version.versionId,
    });
    this.props.callback(version);
  };

  remove = (versionFile, i) => {
    const isFirst = versionFile.versionId === this.state.versionList[0].versionId;
    const isLastLeft =
      this.state.versionList.length === 1 && versionFile.versionId === this.state.versionList[0].versionId;
    if (confirm(!isLastLeft ? '确认删除该版本？' : '这是该文件的最后一个版本，确认删除？')) {
      const removedVersionId = versionFile.versionId;
      kcAjax
        .deleteVersionFile({
          id: versionFile.id,
          versionId: removedVersionId,
        })
        .then(outerItem => {
          if (isLastLeft) {
            alert('删除成功');
            this.props.onClose();
            this.props.performRemoveItems([versionFile.id]);
            return;
          }
          const versionList = this.state.versionList;
          _.remove(versionList, version => version.versionId === removedVersionId);
          this.setState(
            {
              versionList,
            },
            () => {
              if (isFirst && !isLastLeft) {
                const nextVersion = this.state.versionList[0];
                nextVersion.isNew = true;
                this.props.replaceAttachment(nextVersion, outerItem);
                this.setState({ activeVersionId: nextVersion.versionId || '' });
              } else if (this.state.activeVersionId === versionFile.versionId) {
                let nextVersion;
                if (this.state.versionList[i]) {
                  nextVersion = this.state.versionList[i];
                } else {
                  nextVersion = this.state.versionList[i - 1];
                }
                this.props.replaceAttachment(nextVersion);
                this.setState({ activeVersionId: nextVersion.versionId || '' });
              }
            },
          );
          alert('成功删除该版本');
        })
        .fail(() => {
          alert('删除失败', 3);
        });
    }
  };

  download = attachment => {
    if (attachment.canDownload) {
      window.open(downloadFile(attachment.downloadUrl));
    } else {
      alert('您权限不足，无法保存。请联系文件夹管理员或文件上传者', 3);
    }
  };

  renderList = list => {
    return list.map((version, i) => {
      const versionId = version.versionId ? version.versionId : '';
      return (
        <div className={cx('versionItem', { active: versionId === this.state.activeVersionId })} key={i}>
          <span
            className="name ellipsis Hand"
            title={version.name + (version.ext ? '.' + version.ext : '')}
            onClick={() => {
              this.changeVersion(version);
            }}
          >
            {version.name + (version.ext ? '.' + version.ext : '')}
          </span>
          <span className="updater ellipsis" title={version.owner.fullname}>
            {version.owner.fullname}
          </span>
          <span className="createTime">{version.isNew ? '当前版本' : version.createTime}</span>
          <span className="historyBtn btnDelete">
            {(version.isAdmin ||
              version.isCreateUser ||
              (version.owner.accountId === md.global.Account.accountId && list.length > 1)) && (
              <i
                className="icon-delete"
                onClick={() => {
                  this.remove(version, i);
                }}
              />
            )}
          </span>
          <span className="historyBtn btnDownload">
            <i
              className="icon-kc-download"
              onClick={() => {
                this.download(version);
              }}
            />
          </span>
          <span className="historyBtn btnView">
            <i
              className="icon-search"
              onClick={() => {
                this.changeVersion(version);
              }}
            />
          </span>
        </div>
      );
    });
  };

  render() {
    let listContent;
    if (!this.state.versionList) {
      listContent = <LoadDiv />;
    } else {
      listContent = this.renderList(this.state.versionList);
    }
    return <div className="versionList">{listContent}</div>;
  }
}

export default VersionList;
