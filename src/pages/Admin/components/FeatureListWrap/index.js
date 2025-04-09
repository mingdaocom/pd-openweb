import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, Switch, UpgradeIcon } from 'ming-ui';
import cx from 'classnames';
import { getFeatureStatus } from 'src/util';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';

const ConfigItemWrap = styled.div`
  padding: 0 32px;
  &.hoverStyle:hover {
    background: #f5f5f5;
  }
  .content {
    padding: 24px 24px 24px 0;
    border-bottom: 1px solid #eaeaea;
  }
`;

export default function FeatureListWrap(props) {
  const { projectId, configs } = props;

  return (
    <Fragment>
      {configs.map(item => {
        const {
          key,
          icon,
          title,
          description,
          showSlideIcon,
          showSwitch,
          switchChecked,
          showSetting,
          customContent,
          featureId,
          onClick = () => {},
          clickSwitch = () => {},
          clickSetting = () => {},
        } = item;

        const featureType = getFeatureStatus(projectId, featureId);

        if (!_.isUndefined(featureId) && !featureType) return;

        return (
          <ConfigItemWrap
            key={key}
            className={cx({ hoverStyle: showSlideIcon, Hand: showSlideIcon })}
            onClick={() => {
              if (featureId && featureType === '2') {
                buriedUpgradeVersionDialog(projectId, featureId);
                return;
              }
              onClick();
            }}
          >
            <div className="content flexRow alignItemsCenter">
              <div className="flex">
                <div className="bold mBottom5 Font14">
                  {icon && <Icon icon={icon} className="Gray_9e Font18 mRight8" />}
                  {title}
                  {!_.isUndefined(featureId) && featureType === '2' && <UpgradeIcon />}
                </div>
                {description && <div className={cx('Gray_9e', { mTop5: customContent })}>{description}</div>}
                {customContent && <div>{customContent}</div>}
              </div>
              {showSetting && (
                <span className="ThemeColor Hand mRight20" onClick={clickSetting}>
                  {_l('设置')}
                </span>
              )}
              {showSwitch && <Switch checked={switchChecked} onClick={clickSwitch} />}
              {showSlideIcon && <Icon icon="sidebar-more" className="Font18 Gray_9d Right Hand" />}
            </div>
          </ConfigItemWrap>
        );
      })}
    </Fragment>
  );
}

FeatureListWrap.propTypes = {
  projectId: PropTypes.string,
  configs: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        key: PropTypes.string,
        icon: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        clickFuncName: PropTypes.string,
        featureId: PropTypes.number,
      }),
    ]),
  ),
  onClick: PropTypes.func,
};
