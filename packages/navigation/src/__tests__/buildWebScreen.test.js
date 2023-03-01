import { buildWebScreen } from '../buildWebScreen';

const mockComponent = jest.fn();

jest.mock('../WebScreen', () => ({
  WebScreen: mockComponent,
}));

jest.mock('../buildWebScreen', () => ({
  ...jest.requireActual('../buildWebScreen'),
  buildWebviewComponent: jest.fn().mockReturnValue(mockComponent),
}));

const exampleConfig = {
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
        },
      },
    },
    Fallback: { urlPattern: '*', title: '' },
  },
};

const exampleWebScreenResult = {
  linking: {
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
  },
  screens: {
    TestRoute1: {
      name: 'TestRoute1',
      component: () => mockComponent,
      options: {
        title: 'Title 1',
      },
    },
    TestRoute2: {
      name: 'TestRoute2',
      component: () => mockComponent,
      options: {
        presentation: 'modal',
      },
    },
    NestedRoute: {
      name: 'NestedRoute',
      component: () => mockComponent,
      options: {},
    },
    Fallback: {
      name: 'Fallback',
      component: () => mockComponent,
      options: {
        title: '',
      },
    },
  },
};

describe('getLinkingAndScreens()', () => {
  test('should return correct screens for example data', () => {
    const result = buildWebScreen(exampleConfig);
    expect(result).toEqual(exampleWebScreenResult);
  });
});
