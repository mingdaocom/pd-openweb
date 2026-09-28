import React from 'react';
import PropTypes from 'prop-types';
import { sanitizeHtml } from 'src/utils/core/sanitizeHtml';

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
              <img src={medalPath} placeholder="/staticfiles/images/blank.gif" />
            </td>
            <td>
              <p className="colorPrimary mTop20" style={{ fontSize: '12px', lineHeight: '20px' }}>
                {medalName}
              </p>
              <p
                style={{ color: 'var(--color-text-secondary)', fontSize: '12px', lineHeight: '20px' }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
              />
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

export default MedalContent;
