import { createRoot } from 'react-dom/client';
import App from './App';

document.body.addEventListener('dragover', (evt) => {
  evt.preventDefault();
});

document.body.addEventListener('drop', (evt) => {
  evt.preventDefault();
});

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
