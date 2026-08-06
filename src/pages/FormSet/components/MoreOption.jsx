import React from 'react';
import { Dialog, Icon } from 'ming-ui';
import ClickAway from 'ming-ui/components/ClickAway';

const confirm = Dialog.confirm;

export const handleCopyOptionClick = ({ event, setFn, onCopy }) => {
  event.stopPropagation();
  setFn({ showMoreOption: false });
  onCopy();
};

let MoreOption = class MoreOption extends React.Component {
  constructor(props) {
    super(props);
  }

  deleteFn = () => {
    const { setFn, deleteFn, delTxt, description } = this.props;
    setFn({
      isRename: false,
      showMoreOption: false,
    });
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
    const {
      setFn,
      delTxt,
      disabledRename,
      showDisabledRename,
      showCopy,
      onCopy,
      showEnableSwitch,
      disabled,
      onToggleEnable,
    } = this.props;
    return (
      <React.Fragment>
        <ul className="moreOptionTrigger">
          {(!disabledRename || showDisabledRename) && (
            <li
              className={disabledRename ? 'valignWrapper disabled' : 'valignWrapper'}
              onClick={e => {
                e.stopPropagation();

                if (disabledRename) {
                  return;
                }

                setFn({
                  isRename: true,
                  showMoreOption: false,
                });
              }}
            >
              <Icon icon="edit" className="Font16 textTertiary mRight10" />
              {_l('重命名')}
            </li>
          )}
          {showCopy && (
            <li className="valignWrapper" onClick={e => handleCopyOptionClick({ event: e, setFn, onCopy })}>
              <Icon icon="copy" className="Font16 textTertiary mRight10" />
              {_l('复制')}
            </li>
          )}
          {showEnableSwitch && (
            <li
              className={disabled ? 'valignWrapper' : 'Red valignWrapper'}
              onClick={e => {
                e.stopPropagation();
                setFn({
                  showMoreOption: false,
                });
                onToggleEnable(!disabled);
              }}
            >
              <Icon
                icon={disabled ? 'arrow-right-tip' : 'rounded_square'}
                className={disabled ? 'Font16 textTertiary mRight10' : 'Font16 Red mRight10'}
              />
              {disabled ? _l('启用') : _l('停用')}
            </li>
          )}
          {showEnableSwitch && <li className="moreOptionDivider" />}
          <li
            className="Red valignWrapper"
            onClick={e => {
              e.stopPropagation();
              this.deleteFn();
            }}
          >
            <Icon icon="trash" className="Font16 deleteIcon mRight10" />
            {delTxt || _l('删除')}
          </li>
        </ul>
      </React.Fragment>
    );
  }
};
MoreOption = ClickAway.wrap(MoreOption);
export default MoreOption;
