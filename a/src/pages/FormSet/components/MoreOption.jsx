import React from 'react';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Dialog } from 'ming-ui';
const confirm = Dialog.confirm;

@withClickAway
export default class MoreOption extends React.Component {
  constructor(props) {
    super(props);
  }

  deleteFn = () => {
    const { setFn, deleteFn, delTxt, description } = this.props;
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
          {showCopy && (
            <li
              onClick={() => {
                onCopy();
              }}
            >
              {_l('复制')}
            </li>
          )}
          {disabledRename ? (
            ''
          ) : (
            <li
              onClick={() => {
                setFn({
                  isRename: true,
                  showMoreOption: false,
                });
              }}
            >
              {_l('重命名')}
            </li>
          )}
          <li
            className="Red"
            onClick={() => {
              this.deleteFn();
            }}
          >
            {delTxt || _l('删除模板')}
          </li>
        </ul>
      </React.Fragment>
    );
  }
}
