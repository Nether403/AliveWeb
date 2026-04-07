import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import Landing from '@/pages/Landing';
import Archive from '@/pages/Archive';
import ProjectDetail from '@/pages/ProjectDetail';
import SessionTrace from '@/pages/SessionTrace';
import GuidedView from '@/pages/GuidedView';
import Compare from '@/pages/Compare';
import Vault from '@/pages/Vault';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'archive',
        element: <Archive />,
      },
      {
        path: 'project/:slug',
        element: <ProjectDetail />,
      },
      {
        path: 'trace',
        element: <SessionTrace />,
      },
      {
        path: 'compare',
        element: <Compare />,
      },
      {
        path: 'vault',
        element: <Vault />,
      },
      {
        path: 'guided',
        element: <GuidedView />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
