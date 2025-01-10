import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
/*import reportWebVitals from './reportWebVitals';*/

import { Provider } from 'react-redux';
import store from './redux/store';

import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";

import {HomeScreen} from "./screens/Home/Home.Screen";
import {LoginScreen} from "./screens/Login/Login.Screen";
import {PhotoManagementScreen} from "./screens/PhotoManagement/PhotoManagement.screen";

import PrivateRoute from "./routes/private.route";
import AdminRoute from "./routes/admin.route";
import {AddPhoto} from "./screens/PhotoManagement/AddPhoto/AddPhoto";
import {Loader} from "./components/shared/Loader/Loader";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path={"/"} element={<App />}>
            <Route index={true} path={"/"} element={<HomeScreen />} />
            <Route path={"/login"} element={<LoginScreen />} />
            <Route path={""} element={<PrivateRoute />}>
                <Route path={"/favorites"} element={<Loader />} />
            </Route>
            <Route path={"/admin"} element={<AdminRoute />}>
                <Route path={"/admin/photo-management"} element={<PhotoManagementScreen />} />
                <Route path={"/admin/photo-management/addPhoto"} element={<AddPhoto />} />
                <Route path={"/admin/photo-management/updatePhoto"} element={<AddPhoto />} />
            </Route>
        </Route>
    )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <Provider store={store}>
          <RouterProvider router={router} />
      </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
/*reportWebVitals();*/
