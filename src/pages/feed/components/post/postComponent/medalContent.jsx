import { LazyloadImg } from '../../common/img';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * 动态带的徽章
 */
function MedalContent(props) {
  const medal = props.medal;
  const medalName = medal.MedalName;
  const medalPath = medal.MedalPath;
  const description = medal.MedalDescription;
  return (
    <div className="mTop20 mBottom20">
      <table>
        <tbody>
          <tr>
            <td>
              <LazyloadImg src={medalPath} placeholder="/images/blank.gif" />
            </td>
            <td>
              <p className="ThemeColor3 mTop20" style={{ fontSize: '12px', lineHeight: '20px' }}>
                {medalName}
              </p>
              <p style={{ color: '#777', fontSize: '12px', lineHeight: '20px' }} dangerouslySetInnerHTML={{ __html: description }} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
MedalContent.propTypes = {
  medal: PropTypes.shape({
    MedalName: PropTypes.string,
    MedalPath: PropTypes.string,
    MedalDescription: PropTypes.string,
  }),
};

module.exports = MedalContent;
