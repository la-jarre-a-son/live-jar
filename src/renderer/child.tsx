import { createRoot } from 'react-dom/client';
import ChildWindow from './ChildWindow';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<ChildWindow />);
