import { get } from 'lodash';
import { Meteor } from 'meteor/meteor';

import { HospitalLocations, Endpoints } from 'meteor/clinical:hl7-fhir-data-infrastructure';

LocationMethods = {
  createLocation:function(locationObject){
    check(locationObject, Object);

    if (process.env.NODE_ENV === 'test') {
        console.log('Creating Location...');
        Locations.insert(locationObject, function(error, result){
        if (error) {
            console.log(error);
        }
        if (result) {
            console.log('Location created: ' + result);
        }
        });
    } else {
        console.log('This command can only be run in a test environment.');
        console.log('Try setting NODE_ENV=test');
    }
  },  
  removeLocationById: function(locationId){
    check(locationId, String);
    Locations.remove({_id: locationId});
  },
  dropLocations: function(){
    console.log('-----------------------------------------');
    console.log('Dropping Locations... ');
    if (process.env.NODE_ENV === 'test') {
        Locations.remove({});
    } else {
        console.log('This command can only be run in a test environment.');
        console.log('Try setting NODE_ENV=test');
    }
  },
  initializeHospitals: function(){
    LocationMethods.initializeChicagoHospitals();
  },
  // These are Chicago area hospitals
  initializeChicagoHospitals: function(){
    console.log("Initialize hospitals for Chicago.")

    var hospitals = [{
        name: "Childrens Memorial Hospital",
        lat: 41.9247546,
        lng: -87.6472764
    }, {
        name: "Bernard Mitchell Hospital",
        lat: 41.7892007,
        lng: -87.6044935
    }, {
        name: "Gottlieb Memorial Hospital",
        lat: 41.9114198,
        lng: -87.843672
    }, {
        name: "Holy Cross Hospital",
        lat: 41.7694777,
        lng: -87.6922738
    }, {
        name: "Lakeside Veterans Administration",
        lat: 41.8944773,
        lng: -87.6189413
    }, { 
        name: "Little Company of Mary Hospital",
        lat: 41.7219779,
        lng: -87.6914393  
    }, { 
        name: "Methodist Hospital",
        lat: 41.9728097,
        lng: -87.6708897
    }, { 
        name: "Northwestern Memorial Hospital",
        lat: 41.8955885,
        lng: -87.6208858     
    }, { 
        name: "Oak Forest Hospital",
        lat: 41.5983672,
        lng: -87.732549     
    }, { 
        name: "Saint Francis Hospital",
        lat: 41.6580896,
        lng:  -87.6781042       
    }, { 
        name: "Sacred Heart Hospital",
        lat: 41.8905879,
        lng: -87.7081111       
    }, { 
        name: "Roseland Community Hospital",
        lat: 41.6922565,
        lng: -87.6253253
    }, { 
        name: "South Shore Hospital",
        lat: 41.7494792,
        lng:  -87.5692135     
    }, { 
        name: "Hartgrove Hospital",
        lat: 41.8905878,
        lng: -87.7203337
    }, { 
        name: "Glenbrook Hospital",
        lat: 42.0925276,
        lng: -87.852566  
    }, { 
        name: "Garfield Park Hospital",
        lat: 41.8814211,
        lng: -87.7220001 
    }, { 
        name: "Mercy",
        lat: 41.8469777,
        lng: -87.6211623     
    }, { 
        name: "Kindred Chicago Hospital",
        lat: 41.9400318,
        lng:  -87.7292243 
    }, { 
        name: "Norwegian - American Hospital",
        lat:  41.9005879,
        lng:  -87.7000555   
    }, { 
        name: "Oak Park Hospital",
        lat: 41.8786426,
        lng: -87.8031141   
    }, { 
        name: "Passavant Hospital",
        lat: 41.8953107,
        lng:  -87.6197747  
    }, { 
        name: "Reese Hospital",
        lat: 41.8397557,
        lng: -87.6131063 
    }, { 
        name: "Ronald McDonald Childrens Hospital",
        lat: 41.8605869,
        lng: -87.8350591
    }, { 
        name: "Saint Anthony Hospital",
        lat:  41.8553104,
        lng:  -87.697832    
    }, { 
        name: "Shriners Hospital",
        lat: 41.9197536,
        lng: -87.7933926     
    }];

    console.log('Initializing hospitals', hospitals)

    hospitals.forEach(function(hospital){
        if(!HospitalLocations.findOne({name: hospital.name})){
            let newLocation = {
                resourceType: "Location",
                name: hospital.name,
                type: {
                    text: "Hospital"
                },
                position: {
                    latitude: hospital.lat,
                    longitude: hospital.lng,
                    altitude: 594
                },
                location: {
                    type: "Point",
                    coordinates: [hospital.lng, hospital.lat]
                }
            }

            let newHospital = {
                resourceType: 'Organization',
                name: hospital.name
            }
            

            // if we have the autopublish package installed
            // create the Locations on both client and server
            if(Package['clinical:autopublish']){
                HospitalLocations.insert(newLocation);
            } else {
                // otherwise, only install on the client
                if(Meteor.isClient){
                    HospitalLocations.insert(newLocation, {validate: false, filter: false});
                    Organizations.insert(newHospital, {validate: false, filter: false})
                }
            }
        }
    });
  },
  initializeUnitedStatesHospitals: function(){
    console.log("Initialize hospitals for United States.")

    let hospitalGeojson = JSON.parse(Assets.getText('geodata/Hospitals.geojson'));
    console.log('Found the Hospital.geojson asset file.')

    if(hospitalGeojson.type === "FeatureCollection"){
        console.log('Confirming that it contains a FeatureCollection.')
        if(Array.isArray(hospitalGeojson.features)){
            console.log('Hospital asset file contains an array of map features that can be parsed.')

            let hospital = hospitalGeojson.features[0];
            console.log('Spot checking the first entry', hospital)
            console.log('Parsing hospitals....')

            hospitalGeojson.features.forEach(function(hospital){
                if(process.env.DEBUG){
                    console.log('Importing Hospital:  ' + get(hospital, 'properties.NAME'));
                }

                let newHospital = {
                    resourceType: 'Location',
                    id: get(hospital, 'properties.OBJECTID'),
                    identifier: {
                        value: get(hospital, 'properties.ID'),
                        use: 'GIS',
                        system: 'http://www.oshpd.ca.gov/HID/Facility-Listing.html'
                    },
                    name: get(hospital, 'properties.NAME'),
                    mode: 'instance',
                    type: [],
                    address: {
                        use: 'work',
                        type: get(hospital, 'properties.TYPE'),
                        line: [get(hospital, 'properties.ADDRESS')],
                        city: get(hospital, 'properties.CITY'),
                        state: get(hospital, 'properties.STATE'),
                        postalCode: get(hospital, 'properties.ZIP'),
                        country: get(hospital, 'properties.COUNTRY')
                    },
                    endpoint: [{
                        //reference: 'Endpoint/' + newEndpointId,
                        display: get(hospital, 'properties.WEBSITE')
                    }],
                    physicalType: {
                        text: get(hospital, 'properties.NAICS_DESC'),
                        coding: [{
                            code: get(hospital, 'properties.NAICS_CODE'),
                            display: get(hospital, 'properties.NAICS_DESC')
                        }]
                    },
                    position: {
                        longitude: get(hospital, 'properties.LONGITUDE'),
                        latitude: get(hospital, 'properties.LATITUDE')
                    }
                };
                if(get(hospital, 'properties.TRAUMA') === "Y"){
                    newHospital.type.push({
                        text: 'Trauma'
                    })
                }
                if(get(hospital, 'properties.HELIPAD') === "Y"){
                    newHospital.type.push({
                        text: 'Helipad'
                    })
                }
    
                HospitalLocations.upsert({id: get(hospital, 'properties.OBJECTID')}, {$set: newHospital})    
            })

            console.log('HospitalLocations collection now has ', HospitalLocations.find().count() + ' records.');
        } else {
            console.log('Are you sure this is a GeoJson file?  Couldnt find an array of features to parse.')
        }
    } else {
        console.log('Are you sure this is a GeoJson file?  Couldnt find a FeatureCollection.')
    }
  }
}






export default LocationMethods;