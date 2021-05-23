import { get, has } from 'lodash';

import FhirUtilities from '../lib/FhirUtilities';
import LocationMethods from '../lib/LocationMethods';

Meteor.methods({
  getHospitalIndexStatus: function(){
    let status = {};
    
    if(HospitalLocations){
      status.hospitalLocationsCount = HospitalLocations.find().count()
    }

    return status;
  },
  initializeHospitalIndex: function(data){

    LocationMethods.initializeUnitedStatesHospitals();
  },
  fetchAllHospitalLocations: function(){
    console.log("Received request for all hospital locations.")
    return HospitalLocations.find().fetch();
  },
  fetchHospitalsNear: function(centroid){
    console.log("Received request for all hospital near :" + centroid);
    return HospitalLocations.find({

    }).fetch();
  },
  fetchHospitalsByCity: function(city){
    console.log("Received request for all hospital in " + city);

    let hospitals = HospitalLocations.find({
      'address.city': String(city).toUpperCase()
    }).fetch();

    console.log('Found ' + hospitals.length + ' hospitals.')

    return hospitals;
  },
  fetchHospitalsByState: function(state){
    console.log("Received request for all hospital near :" + state);

    let hospitals = HospitalLocations.find({
      'address.state': String(state).toUpperCase()
    }).fetch();

    console.log('Found ' + hospitals.length + ' hospitals.')
    return hospitals;
  },
  dropHospitals: function(){
    console.log('Clearing hospitals...');
    HospitalLocations.remove({});
  }
});


Meteor.startup(function(){
  if(get(Meteor, 'settings.private.initializeHospitalIndex') === true)
  console.log('Server is set to auto-initialize hospital index.')


  // if(HospitalLocations.find().count() === 0){
  if(get(Meteor, 'settings.private.initializeHospitalIndex')){
    console.log('Hospital index is empty.  Beginning initialization sequence.')
    Meteor.call('initializeHospitalIndex');
  }
})