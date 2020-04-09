import React from 'react';

import GeocodingPage from './client/GeocodingPage';
import MunicipalMapPage from './client/MunicipalMapPage';
import HospitalsMapPage from './client/HospitalsMapPage';

import { 
  MapButtons
} from './client/FooterButtons';


var DynamicRoutes = [{
  'name': 'MapPage',
  'path': '/map',
  'component': MunicipalMapPage,
  'requireAuth': true
}, {
  'name': 'HospitalsMapPage',
  'path': '/hospitals-map',
  'component': HospitalsMapPage,
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
  MunicipalMapPage,
  HospitalsMapPage,

  FooterButtons
};
