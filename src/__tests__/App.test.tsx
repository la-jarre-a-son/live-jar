import '@testing-library/jest-dom';
import { render, act } from '@testing-library/react';
import App from '../renderer/App';

describe('App', () => {
  it('should render', async () => {
    const el = document.createElement('div');
    await act(async () => {
      await render(<App />, { container: el });
    });

    expect(el).toMatchSnapshot();
  });
});
