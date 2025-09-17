import '@testing-library/jest-dom';
import { render, act } from '@testing-library/react';
import ChildWindow from '../renderer/ChildWindow';

describe('ChildWindow', () => {
  it('should render', async () => {
    const el = document.createElement('div');
    await act(async () => {
      await render(<ChildWindow />, { container: el });
    });

    expect(el).toMatchSnapshot();
  });
});
