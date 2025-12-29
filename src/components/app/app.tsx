import { RouterProvider, useLocation } from 'react-router-dom';
import '../../index.css';
import styles from './app.module.css';

import { router } from '../../routes/router';

const App = () => (
  <div className={styles.app}>
    <RouterProvider router={router} />
  </div>
);

export default App;
