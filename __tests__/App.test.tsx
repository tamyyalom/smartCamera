/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/navigation/RootNavigator', () => ({
  RootNavigator: () => null,
}));

import App from '../App';

test('renders app shell without crashing', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
