import { get, has } from 'lodash';

import FhirUtilities from '../lib/FhirUtilities';
import LocationMethods from '../lib/LocationMethods';

Meteor.methods({
  initializeHospitalIndex: function(data){

    LocationMethods.initializeUnitedStatesHospitals();
  }
});