import React from 'react';

import GeocodingPage from './client/GeocodingPage';
import MunicipalMapPage from './client/MunicipalMapPage';
import HospitalsMapPage from './client/HospitalsMapPage';

import HospitalLocationsPage from './client/HospitalLocationsPage';
import HospitalSearchDialog from './client/HospitalSearchDialog';

import { 
  MapButtons,
  HospitalsMapButtons,
  HospitalLocationButtons
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
}, {
  'name': 'HospitalLocationsPage',
  'path': '/hospital-locations',
  'component': HospitalLocationsPage,
  'requireAuth': true
}];


let SidebarWorkflows = [{
  'primaryText': 'Provider Directory',
  'to': '/hospital-locations',
  'href': '/hospital-locations',
  'iconName': 'hospitalO'
}];

// var SidebarElements = [{
//   primaryText: 'Privacy Policy',
//   to: '/privacy',
//   iconName: 'document'
// }];


let FooterButtons = [{
  pathname: '/map',
  component: <MapButtons />
}, {
  pathname: '/hospital-locations',
  component: <HospitalLocationButtons />
}, {
  pathname: '/hospitals-map',
  component: <HospitalsMapButtons />
}];

let DialogComponents = [{
  name: "HospitalSearchDialog",
  component: <HospitalSearchDialog />
}]


export { 
  DynamicRoutes, 

  GeocodingPage,
  MunicipalMapPage,
  HospitalsMapPage,

  HospitalLocationsPage,

  FooterButtons,
  SidebarWorkflows,
  DialogComponents
};
