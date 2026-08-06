import React, { useCallback, useRef, useState } from 'react';
import OverviewPopup, { OverviewController } from 'src/pages/Mobile/Mingo/components/OverviewPopup';

export default function AnonymousMobileOverview({ autoOpenOnReady = false }) {
  const filesRef = useRef({});
  const autoOpenedRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState('');
  const [ready, setReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filesVersion, setFilesVersion] = useState(0);

  const handleFilesChange = useCallback(() => {
    setFilesVersion(version => version + 1);
  }, []);

  const handleReadyChange = useCallback(
    nextReady => {
      setReady(nextReady);
      if (nextReady && autoOpenOnReady && !autoOpenedRef.current) {
        autoOpenedRef.current = true;
        setVisible(true);
      }
    },
    [autoOpenOnReady],
  );

  return (
    <React.Fragment>
      <OverviewController
        filesRef={filesRef}
        setOverviewContent={setContent}
        setOverviewReady={handleReadyChange}
        setOverviewVisible={setVisible}
        onFilesChange={handleFilesChange}
      />
      <OverviewPopup
        visible={visible}
        content={content}
        ready={ready}
        generating={generating}
        filesRef={filesRef}
        filesVersion={filesVersion}
        onClose={() => setVisible(false)}
        onGenerateStart={() => {
          setGenerating(true);
          setVisible(false);
        }}
      />
    </React.Fragment>
  );
}
