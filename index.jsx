import React from 'react';

import GeocodingPage from './client/GeocodingPage';
import GoogleMapsPage from './client/GoogleMapsPage';

import { 
  MapButtons
} from './client/FooterButtons';

import { HeaderNavigation } from './client/HeaderNavigation';

var DynamicRoutes = [{
  'name': 'MapPage',
  'path': '/map',
  'component': GoogleMapsPage,
  'requireAuth': true
}, {
  'name': 'GeocodingPage',
  'path': '/geocoding',
  'component': GeocodingPage,
  'requireAuth': true
}];

let FooterButtons = [{
  pathname: '/map',
  component: <MapButtons />
}];



export { 
  DynamicRoutes, 

  GeocodingPage,
  GoogleMapsPage,

  HeaderNavigation,
  FooterButtons
};
