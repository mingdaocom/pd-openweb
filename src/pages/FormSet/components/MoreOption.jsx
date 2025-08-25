import React from 'react';
import { Dialog, Icon } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';

const confirm = Dialog.confirm;

@withClickAway
export default class MoreOption extends React.Component {
  constructor(props) {
    super(props);
  }

  deleteFn = () => {
    const { setFn, deleteFn, delTxt, description } = this.props;

    setFn({ isRename: false, showMoreOption: false });

    return confirm({
      title: <span className="Red">{delTxt || _l('删除模板')}</span>,
      description: description || _l('删除后将无法恢复'),
      buttonType: 'danger',
      onOk: () => {
        deleteFn();
      },
    });
  };

  render() {
    const { setFn, delTxt, disabledRename, showCopy, onCopy } = this.props;
    return (
      <React.Fragment>
        <ul className="moreOptionTrigger">
          {disabledRename ? (
            ''
          ) : (
            <li
              className="valignWrapper"
              onClick={e => {
                e.stopPropagation();
                setFn({
                  isRename: true,
                  showMoreOption: false,
                });
              }}
            >
              <Icon icon="edit" className="Font16 Gray_9e mRight10" />
              {_l('重命名')}
            </li>
          )}
          {showCopy && (
            <li
              className="valignWrapper"
              onClick={e => {
                e.stopPropagation();
                onCopy();
              }}
            >
              <Icon icon="copy" className="Font16 Gray_9e mRight10" />
              {_l('复制')}
            </li>
          )}
          <li
            className="Red valignWrapper"
            onClick={e => {
              e.stopPropagation();
              this.deleteFn();
            }}
          >
            <Icon icon="trash" className="Font16 deleteIcon mRight10" />
            {delTxt || _l('删除模板')}
          </li>
        </ul>
      </React.Fragment>
    );
  }
}
