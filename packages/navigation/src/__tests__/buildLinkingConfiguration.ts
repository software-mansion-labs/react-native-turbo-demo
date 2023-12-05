import buildLinkingConfiguration from '../buildLinkingConfiguration';
import { WebScreenRuleConfig } from '../types';

const mockComponent = jest.fn();

jest.mock('../WebScreen', () => ({
  WebScreen: mockComponent,
}));

jest.mock('../buildWebScreen', () => ({
  ...jest.requireActual('../buildWebScreen'),
  buildWebviewComponent: () => () => mockComponent,
}));

const exampleConfig: WebScreenRuleConfig = {
  baseURL: 'http://localhost:test/',
  routes: {
    TestRoute1: {
      urlPattern: 'url1',
      title: 'Title 1',
    },
    TestRoute2: {
      urlPattern: 'url2',
      presentation: 'modal',
    },
    TestRoute3: {
      routes: {
        NestedRoute: {
          urlPattern: 'urlNested',
          title: 'Nested',
        },
      },
    },
    Fallback: { urlPattern: '*', title: '' },
  },
};

const exampleWebScreenResult = {
  prefixes: ['http://localhost:test/'],
  config: {
    screens: {
      TestRoute1: 'url1',
      TestRoute2: 'url2',
      TestRoute3: {
        screens: {
          NestedRoute: 'urlNested',
        },
      },
      Fallback: '*',
    },
  },
};

describe('buildLinkingConfiguration()', () => {
  test('should return correct links for example data', () => {
    const result = buildLinkingConfiguration(exampleConfig);
    expect(result).toEqual(exampleWebScreenResult);
  });
});
