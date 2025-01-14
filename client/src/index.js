import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
/*import reportWebVitals from './reportWebVitals';*/
//import 'react-toastify/dist/ReactToastify.css';

import { HelmetProvider, Helmet } from 'react-helmet-async';

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
import {
    SEO_DESCRIPTION,
    SEO_KEYWORDS, SEO_OG_IMG_REF,
    SEO_OG_TYPE,
    SEO_SITE_AUTHOR,
    SEO_SITE_URL,
    SEO_TITLE
} from "./constants/seo.constants";

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
      <HelmetProvider>
          <Helmet prioritizeSeoTags>
              { /* Standard metadata tags */}
              <meta charSet="utf-8"/>
              <title>{SEO_TITLE}</title>
              <meta name='description' content={SEO_DESCRIPTION}/>
              <meta name="keywords" content={SEO_KEYWORDS}/>
              <meta name="author" content={SEO_SITE_AUTHOR}/>
              <meta name="viewport" content="width=device-width, initial-scale=1"/>
              <meta name="google" content="notranslate"/>
              <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
              { /* End standard metadata tags */}

              { /* Open Graphic metadata tags */}
              <meta property="og:type" content={SEO_OG_TYPE}/>
              <meta property="og:site_name" content={SEO_TITLE}/>
              <meta property="og:title" content={SEO_TITLE}/>
              <meta property="og:url" content={SEO_SITE_URL}/>
              <meta property="og:image" content={SEO_OG_IMG_REF}/>
              <meta property="og:description" content={SEO_DESCRIPTION}/>
              { /* End Open Graphic metadata tags */}

              { /* Apple */}
              <meta name="apple-mobile-web-app-title" content={SEO_TITLE}/>
              <link rel="apple-touch-icon" href="/logo192.png"/>
              { /* End Apple */}

              { /* Robots & Manifest & Other Links */}
              <meta name="robots" content="index, nofollow"/>
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
