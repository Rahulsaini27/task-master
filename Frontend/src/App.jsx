import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import ProtectedRoute from "./Context/ProtectedRoute";
import Dashboard from "./Comp/Dashboard";
import User from "./Comp/User";
import Task from "./Comp/Task";
import Unauthorized from "./Comp/Unauthorized";
import AddTask from "./Comp/AddTask";
import EditTask from "./Comp/EditTask";
import NotificationPage from "./Comp/NotificationPage";

function App() {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    // Admin routes
    {
      element: <ProtectedRoute allowedRoles={['admin']} />,
      children: [
        {
          path: "/layout",
          element: <Layout />,
          children: [
            { path: "dashboard", element: <Dashboard /> },
            { path: "user", element: <User /> },
            { path: "task", element: <Task /> },
            { path: "task/add-task", element: <AddTask />  },
            { path: "task/edit-task/:taskId", element: <EditTask />  },

          ],
        },
      ],
    },
    // Manager routes
    {
      element: <ProtectedRoute allowedRoles={['manager']} />,
      children: [
        {
          path: "/layout",
          element: <Layout />,
          children: [
            { path: "dashboard", element: <Dashboard /> },
            { path: "task", element: <Task />  },
            { path: "notification", element: <NotificationPage />  },

            { path: "task/add-task", element: <AddTask />  },
            { path: "task/edit-task/:taskId", element: <EditTask />  },


          ],
        },
      ],
    },
    // User routes
    {
      element: <ProtectedRoute allowedRoles={['user']} />,
      children: [
        {
          path: "/layout",
          element: <Layout />,
          children: [
            { path: "dashboard", element: <Dashboard /> },

            { path: "task", element: <Task /> },
          ],
        },
      ],
    },
    // Unauthorized page (optional)
    {
      path: "/layout/unauthorized",
      element: <Unauthorized />,
    },
  ]);

  return <RouterProvider router={routes} />;
}

export default App;
