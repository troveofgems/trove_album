import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';
/*import reportWebVitals from './reportWebVitals';*/

import { HelmetProvider, Helmet } from 'react-helmet-async';

import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";

import './index.css';

// Components & Constants
import App from './App';
import {Loader} from "./components/shared/Loader/Loader";
import { SEO_SITE_URL, SEO_TITLE } from "./constants/seo.constants";

// Routes
import PrivateRoute from "./routes/private.route";
import AdminRoute from "./routes/admin.route";

// Screens
import {HomeScreen} from "./screens/Home/Home.Screen";
import {LoginScreen} from "./screens/Login/Login.Screen";
import {Analytics} from "./screens/Analytics/Analytics";
import {PhotoManagementScreen} from "./screens/PhotoManagement/PhotoManagement.screen";
import {AddPhoto} from "./screens/PhotoManagement/AddPhoto/AddPhoto";
import {UpdatePhoto} from "./screens/PhotoManagement/UpdatePhoto/UpdatePhoto";
import {FiltersExplanation} from "./screens/FiltersExplanation/FiltersExplanation";

// CSS
import 'react-toastify/dist/ReactToastify.css';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path={"/"} element={<App />}>
            <Route index={true} path={"/"} element={<HomeScreen />} />
            <Route path={"/page/:page"} element={<HomeScreen />} />
            <Route path={"/search"} element={<HomeScreen />} />
            <Route path={"/search/:keywords/page/:page"} element={<HomeScreen />} />
            <Route path={"/login"} element={<LoginScreen />} />
            <Route path={"/site-filters-explanation"} element={<FiltersExplanation />} />
            <Route path={"/analytics"} element={<Analytics />} />
            <Route path={""} element={<PrivateRoute />}>
                <Route path={"/favorites"} element={<Loader />} />
            </Route>
            <Route path={"/admin"} element={<AdminRoute />}>
                <Route path={"/admin/photo-management"} element={<PhotoManagementScreen />} />
                <Route path={"/admin/photo-management/addPhoto"} element={<AddPhoto />} />
                <Route path={"/admin/resource-management/photos/:photoId"} element={<UpdatePhoto />} />
            </Route>
        </Route>
    )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <HelmetProvider>
          <Helmet prioritizeSeoTags>
              { /* Standard metadata tags */}
              <meta name="viewport" content="width=device-width, initial-scale=1"/>
              <meta name="google" content="notranslate"/>
              <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
              { /* End standard metadata tags */}

              { /* Open Graphic metadata tags */}

              { /* End Open Graphic metadata tags */}

              { /* Apple */}
              <meta name="apple-mobile-web-app-title" content={SEO_TITLE}/>
              <link rel="apple-touch-icon" href="/logo192.png"/>
              { /* End Apple */}

              { /* Robots & Manifest & Other Links */}
              <meta name="robots" content="index, follow"/>
              <link rel="manifest" href="/manifest.json"/>
              <link rel="canonical" href={SEO_SITE_URL}/>
              <link rel="icon" href="/favicon.ico"/>
              { /* End Robots & Manifest & Other Links */}
          </Helmet>
          <Provider store={store}>
              <RouterProvider router={router}/>
          </Provider>
      </HelmetProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
/*reportWebVitals();*/
