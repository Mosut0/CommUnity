import { render } from '@testing-library/react-native';
import { ReportMarker } from '../MapScreen/ReportMarker';
import React from 'react';

describe('ReportMarker', () => {
  const report = {
    reportid: 1,
    category: 'event',
    description: 'Test event',
    location: '(0,0)',
    createdAt: '',
  };
  it('renders without crashing', () => {
    render(
      <ReportMarker
        report={report}
        selectedReport={null}
        onPress={() => {}}
        tracksViewChanges={false}
        displayCoords={{ latitude: 0, longitude: 0 }}
        markerRef={() => {}}
      />
    );
  });
});
