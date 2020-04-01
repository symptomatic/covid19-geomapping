import React, { Component, useState, useEffect } from 'react';


import { makeStyles, withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';


import { get, has } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';
import JSON5 from 'json5';

import moment from 'moment';

import { Patients, Encounters, Observations, EncountersTable, ConditionsTable, ProceduresTable, LocationsTable } from 'meteor/clinical:hl7-fhir-data-infrastructure';

import { PageCanvas, StyledCard, PatientTable } from 'material-fhir-ui';
import { useTracker } from './Tracker';

import FhirUtilities from '../lib/FhirUtilities';

import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';


//--------------------------------------------------------------------------------
// Theming  

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  button: {
    margin: theme.spacing(1)
  }
}));

//--------------------------------------------------------------------------------
// Session Variables

Session.setDefault('geoJsonLayer', "");


//--------------------------------------------------------------------------------
// Pure Components

function DynamicSpacer(props){
  return <br className="dynamicSpacer" style={{height: '40px'}}/>;
}

function GeocodingPage(props){
  let selectedStartDate = Session.get("fhirKitClientStartDate");
  let selectedEndDate = Session.get("fhirKitClientEndDate");

  let totalEncountersDuringDateRange = 0;

  const classes = useStyles();

  const rowsPerPage = get(Meteor, 'settings.public.defaults.rowsPerPage', 25);


  let [patients,   setPatients]   = useState([]);
  let [encounters, setEncounters] = useState([]);
  let [conditions, setConditions] = useState([]);
  let [procedures, setProcedures] = useState([]);
  let [locations,  setLocations]  = useState([]);

  let [checkedTested,  setCheckedTested]  = useState(false);
  let [checkedFever,  setCheckedFever]  = useState(true);
  let [checkedCough,  setCheckedCough]  = useState(false);
  let [checkedDyspnea,  setCheckedDyspnea]  = useState(false);
  let [checkedVentilator,  setCheckedVentilator]  = useState(true);
  let [checkedOxygenAdministration,  setCheckedOxygenAdministration]  = useState(true);
  let [checkedCovid19,  setCheckedCovid19]  = useState(true);
  let [checkedSuspectedCovid19,  setCheckedSuspectedCovid19]  = useState(true);
  let [checkedHydroxychloroquine,  setCheckedHydroxychloroquine]  = useState(false);
  let [checkedBloodTypeA,  setCheckedBloodTypeA]  = useState(false);
  let [checkedSmoker,  setCheckedSmoker]  = useState(false);
  let [checkedHypertension,  setCheckedHypertension]  = useState(false);
  let [checkedTamiflu,  setCheckedTamiflu]  = useState(false);
  let [checkedSerumAntibodies,  setCheckedSerumAntibodies]  = useState(false);
  let [checkedVaccinated,  setCheckedVaccinated]  = useState(false);
  

  let [fhirServerEndpoint, setFhirServerEndpoint] = useState(get(Meteor, 'settings.public.interfaces.default.channel.endpoint', 'http://localhost:3100/baseR4'));


  //-------------------------------------------------------------------
  // Tracking

  selectedStartDate = useTracker(function(){
    return Session.get("fhirKitClientStartDate");
  }, []);

  selectedEndDate = useTracker(function(){
    return Session.get("fhirKitClientEndDate");
  }, []);  

  totalEncountersDuringDateRange = useTracker(function(){
    return Session.get("totalEncountersDuringDateRange");
  }, []);  



  let encounterCursor;
  encounterCursor = useTracker(function(){    
    logger.trace('GeocodingPage.Encounters.find()', Encounters.find().fetch());
    return Encounters.find();
  }, [props.lastUpdated]);  

  if(encounterCursor){
    encounters = encounterCursor.fetch();
  }

  let patientsCursor;
  patientsCursor = useTracker(function(){
    // this console logging statement may be creating a side effect
    // that triggers the re-render
    //logger.debug('GeocodingPage.Patients.find()', Patients.find().fetch());
    return Patients.find();
  }, [props.lastUpdated]);  
  if(patientsCursor){
    patients = patientsCursor.fetch();
  }

  let conditionsCursor;
  conditionsCursor = useTracker(function(){
    // this console logging statement may be creating a side effect
    // that triggers the re-render
    //logger.trace('GeocodingPage.Conditions.find()', Conditions.find().fetch());
    return Conditions.find();
  }, [props.lastUpdated]); 
  if(conditionsCursor){
    conditions = conditionsCursor.fetch();
  }

  let proceduresCursor;
  proceduresCursor = useTracker(function(){
    // this console logging statement may be creating a side effect
    // that triggers the re-render
    //logger.debug('GeocodingPage.Procedures.find()', Procedures.find().fetch());
    return Procedures.find();
  }, [props.lastUpdated]); 
  if(proceduresCursor){
    procedures = proceduresCursor.fetch();
  }


  let locationsCursor;
  locationsCursor = useTracker(function(){
    // this console logging statement may be creating a side effect
    // that triggers the re-render
    //logger.debug('GeocodingPage.Procedures.find()', Procedures.find().fetch());
    return Locations.find();
  }, [props.lastUpdated]); 
  if(locationsCursor){
    locations = locationsCursor.fetch();
  }


  //-------------------------------------------------------------------
  // Progress Bars

  

  const [autofetchCompleted, setAutofetchCompleted] = React.useState(0);
  const [fetchEverythingCompleted, setFetchEverythingCompleted] = React.useState(0);
  const [autofetchBuffer, setAutofetchBuffer] = React.useState(10);



  
  let encounterCount = 0;
  encounterCount = useTracker(function(){    
    setAutofetchCompleted(Encounters.find().count());
    return Encounters.find().count()
  }, []);  

  let patientCount = 0;
  patientCount = useTracker(function(){    
    return Patients.find().count()
  }, []);  

  let conditionCount = 0;
  conditionCount = useTracker(function(){    
    return Conditions.find().count()
  }, []);  

  let procedureCount = 0;
  procedureCount = useTracker(function(){    
    return Procedures.find().count()
  }, []);  

  let locationCount = 0;
  locationCount = useTracker(function(){    
    return Locations.find().count()
  }, []);  


  let encounterUrl = 0;
  encounterUrl = useTracker(function(){    
    return Session.get('encounterUrl')
  }, [props.lastUpdated]);  

  let conditionUrl = 0;
  conditionUrl = useTracker(function(){    
    return Session.get('conditionUrl')
  }, [props.lastUpdated]);  

  let procedureUrl = 0;
  procedureUrl = useTracker(function(){    
    return Session.get('procedureUrl')
  }, [props.lastUpdated]);  


  let geoJsonLayer = 0;
  let geoJsonLayerFeaturesCount = 0;
  geoJsonLayer = useTracker(function(){    
    return Session.get('geoJsonLayer')
  }, [props.lastUpdated]);  
  if(geoJsonLayer && Array.isArray(geoJsonLayer.features)){
    geoJsonLayerFeaturesCount = geoJsonLayer.features.length
  }

  //-------------------------------------------------------------------
  // Navigation Methods

  function openPage(url){
    logger.debug('client.app.patient.PatientSidebar.openPage', url);
    if(props.history){
      props.history.replace(url)
    }
  }

  //-------------------------------------------------------------------
  // Toggle Methods

  function handleToggleFever(props){
    logger.warn('GeocodingPage.handleToggleFever()');

    if(checkedFever){
      setCheckedFever(false);
    } else {
      setCheckedFever(true);
    }
  }
  function handleToggleCough(props){
    logger.warn('GeocodingPage.handleToggleCough()');

    if(checkedCough){
      setCheckedCough(false);
    } else {
      setCheckedCough(true);
    }
  }
  function handleToggleDyspnea(props){
    logger.warn('GeocodingPage.handleToggleDyspnea()');

    if(checkedDyspnea){
      setCheckedDyspnea(false);
    } else {
      setCheckedDyspnea(true);
    }
  }
  function handleToggleVentilator(props){
    logger.warn('GeocodingPage.handleToggleVentilator()');

    if(checkedVentilator){
      setCheckedVentilator(false);
    } else {
      setCheckedVentilator(true);
    }
  }
  function handleToggleOxygenAdministration(props){
    logger.warn('GeocodingPage.handleToggleOxygenAdministration()');

    if(checkedOxygenAdministration){
      setCheckedOxygenAdministration(false);
    } else {
      setCheckedOxygenAdministration(true);
    }
  }
  
  function handleToggleTested(props){
    logger.warn('GeocodingPage.handleToggleTested()');

    if(checkedTested){
      checkedTested(false);
    } else {
      setCheckedTested(true);
    }
  }
  function handleToggleSuspectedCovid19(props){
    logger.warn('GeocodingPage.handleToggleSuspectedCovid19()');

    if(checkedSuspectedCovid19){
      setCheckedSuspectedCovid19(false);
    } else {
      setCheckedSuspectedCovid19(true);
    }
  }
  function handleToggleCovid19(props){
    logger.warn('GeocodingPage.handleToggleCovid19()');

    if(checkedCovid19){
      setCheckedCovid19(false);
    } else {
      setCheckedCovid19(true);
    }
  }

  function handleToggleHydroxychloroquine(props){
    logger.warn('GeocodingPage.handleToggleHydroxychloroquine()');

    if(checkedHydroxychloroquine){
      setCheckedHydroxychloroquine(false);
    } else {
      setCheckedHydroxychloroquine(true);
    }
  }
  function handleToggleBloodTypeA(props){
    logger.warn('GeocodingPage.handleToggleBloodTypeA()');

    if(checkedBloodTypeA){
      setCheckedBloodTypeA(false);
    } else {
      setCheckedBloodTypeA(true);
    }
  }
  function handleToggleSmoker(props){
    logger.warn('GeocodingPage.handleToggleSmoker()');

    if(checkedSmoker){
      setCheckedSmoker(false);
    } else {
      setCheckedSmoker(true);
    }
  }
  function handleToggleHypertension(props){
    logger.warn('GeocodingPage.handleToggleHypertension()');

    if(checkedHypertension){
      setCheckedHypertension(false);
    } else {
      setCheckedHypertension(true);
    }
  }
  function handleToggleTamiflu(props){
    logger.warn('GeocodingPage.handleToggleTamiflu()');

    if(checkedTamiflu){
      setCheckedTamiflu(false);
    } else {
      setCheckedTamiflu(true);
    }
  }
  function handleToggleSerumAntibodies(props){
    logger.warn('GeocodingPage.handleToggleSerumAntibodies()');

    if(checkedSerumAntibodies){
      setCheckedSerumAntibodies(false);
    } else {
      setCheckedSerumAntibodies(true);
    }
  }
  function handleToggleVaccinated(props){
    logger.warn('GeocodingPage.handleToggleVaccinated()');

    if(checkedVaccinated){
      setCheckedVaccinated(false);
    } else {
      setCheckedVaccinated(true);
    }
  }

  

  
  

  //-------------------------------------------------------------------
  // Button Methods

  function geocodeCentroid(props){
    logger.warn('GeocodingPage.geocodeCentroid()');

  }


  function handleFetchEncounters(props){
    logger.warn('GeocodingPage.handleFetchEncounters()');

    fetchEncounterData(props, function(){
      fetchPatientsFromFhirArray(props, Encounters.find().fetch());
    });
  }
  function handleFetchConditions(props){
    logger.warn('GeocodingPage.handleFetchConditions()');

    fetchConditionData(props, function(){
      fetchPatientsFromFhirArray(props, Conditions.find().fetch());
    });
  }
  function handleFetchProcedures(props){
    logger.warn('GeocodingPage.handleFetchProcedures()');

    fetchProcedureData(props, function(){
      fetchPatientsFromFhirArray(props, Procedures.find().fetch());
    });
  }

  function handleGeocodeAddresses(props){
    logger.warn('GeocodingPage.handleGeocodeAddresses()');
    logger.debug('GeocodingPage.handleGeocodeAddresses().patients?', patients);

    patients.forEach(function(patient){
      Meteor.call('geocodePatientAddress', patient, function(error, result){
        if(error){
          console.log('geocodeAddress.error', error)
        }
        if(result){
          console.log('geocodeAddress.result', result)
 
          if(get(result, 'resourceType') === "Location"){
            Locations.insert(result, {filter: false, validate: false});
          }
        }
      })
    });

    // Meteor.call('geocodePatientAddresses', patients, function(error, results){
    //   if(error){
    //     console.log('geocodeAddress.error', error)
    //   }
    //   if(results){
    //     console.log('geocodeAddress.results', results)

    //     if(Array.isArray(results)){
    //       results.forEach(function(location){
    //         Locations.insert(location);
    //       })
    //     }
    //   }
    // })
  }

  function clearProcedures(){
    logger.warn('GeocodingPage.clearProcedures()');
    Procedures.remove({});
  }
  function clearEncounters(){
    logger.warn('GeocodingPage.clearEncounters()');
    Encounters.remove({});
  }
  function clearConditions(){
    logger.warn('GeocodingPage.clearConditions()');
    Conditions.remove({});
  }
  function clearPatients(){
    logger.warn('GeocodingPage.clearPatients()');
    Patients.remove({});
  }
  function clearLocations(){
    logger.warn('GeocodingPage.clearLocations()');
    Locations.remove({});
  }
  function clearGeoJson(){
    logger.warn('GeocodingPage.clearGeoJson()');
    Session.set('geoJsonLayer', "")
  }

  function generateGeoJson(){
    logger.warn('GeocodingPage.generateGeoJson()');

    let newGeoJson = {
      "type": "FeatureCollection",
      "features": []
    }

    let proximityCount = Locations.find({_location: {$near: {
      $geometry: {
        type: 'Point',
        coordinates: [-88.0020589, 42.01136169999999]
      },
      // Convert [mi] to [km] to [m]
      $maxDistance: 50 * 1.60934 * 1000
    }}}).count();

    console.log('Found ' + proximityCount + ' locations within 50 miles of the search origin.')

    let count = 0;
    Locations.find({_location: {$near: {
      $geometry: {
        type: 'Point',
        coordinates: [-88.0020589, 42.01136169999999]
      },
      // Convert [mi] to [km] to [m]
      $maxDistance: 50 * 1.60934 * 1000
    }}}).forEach(function(location){
      count++;

      if(get(location, 'position.longitude') && get(location, 'position.latitude')){
        let newFeature = { 
          "type": "Feature", 
          "properties": { 
            "id": (count).toString(),                 
            "primary_type": "POSITIVE",                           
            "location_zip": get(location, 'address.postalCode'),      
            "location_address": get(location, 'address.line[0]'),    
            "location_city": get(location, 'address.city'),                    
            "location_state": get(location, 'address.state'),
            "longitude": (get(location, 'position.longitude')).toFixed(9).toString(),
            "latitude": (get(location, 'position.latitude')).toFixed(9).toString()        
          }, 
          "geometry": { 
            "type": "Point", 
            "coordinates": [ Number((get(location, 'position.longitude')).toFixed(9)), Number((get(location, 'position.latitude')).toFixed(9)) ] 
          }
        }
  
        newGeoJson.features.push(newFeature);
      }      
    })

    console.log('newGeoJson', newGeoJson)
    Session.set('geoJsonLayer', newGeoJson)
  }

  //-------------------------------------------------------------------
  // Recursive Methods

  async function recursiveEncounterQuery(fhirClient, searchResponse, encountersArray, callback){
    logger.debug('recursiveEncounterQuery', fhirClient, searchResponse);
  
    let self = this;

    function hasNext(searchResponse){
      let result = false;
      if(get(searchResponse, 'link')){
        searchResponse.link.forEach(function(link){
          if(get(link, 'relation') === "next"){
            result = true;
          }
        })
      }
      return result;
    }

    let recursiveResult = null;
    if(hasNext(searchResponse)){
      logger.debug('Found a next link in the bundle.  Fetching...')
      recursiveResult = await fhirClient.nextPage(searchResponse)
      .then((newResponse) => {
        logger.trace('recursiveEncounterQuery().fhirClient.nextPage().newResponse', newResponse);

        if(get(newResponse, 'resourceType') === "Bundle"){
          logger.debug('Parsing a Bundle.')
          let entries = get(newResponse, 'entry', []);

          entries.forEach(function(entry){
            if(get(entry, 'resource.resourceType') === "Encounter"){
              logger.trace('Found an encounter', get(entry, 'resource'));

              if(!Encounters.findOne({id: get(entry, 'resource.id')})){
                let encounterId = Encounters.insert(get(entry, 'resource'), {validate: false, filter: false});
                logger.trace('Just received new encounter: ' + encounterId);
    
                if(!get(entry, 'resource.id')){
                  entry.resource.id = encounterId;
                } 
                if(!get(entry, 'resource._id')){
                  entry.resource._id = encounterId;
                }
    
                encountersArray.push(get(entry, 'resource'))  
              }
            }
          })        

          // setEncounters(encountersArray);  // this is mostly just to update the progress so people see things are loading
          encountersArray = recursiveEncounterQuery(fhirClient, newResponse, encountersArray, callback)
        } 

        // setEncounters(encountersArray);
        return encountersArray;
      })
    } else {
      callback();
    }

    return recursiveResult;
  }



  async function recursiveConditionQuery(fhirClient, searchResponse, conditionsArray, callback){
    logger.debug('recursiveConditionQuery', fhirClient, searchResponse);
  
    let self = this;

    function hasNext(searchResponse){
      let result = false;
      if(get(searchResponse, 'link')){
        searchResponse.link.forEach(function(link){
          if(get(link, 'relation') === "next"){
            result = true;
          }
        })
      }
      return result;
    }

    let recursiveResult = null;
    if(hasNext(searchResponse)){
      logger.debug('Found a next link in the bundle.  Fetching...')
      recursiveResult = await fhirClient.nextPage(searchResponse)
      .then((newResponse) => {
        logger.trace('recursiveConditionQuery().fhirClient.nextPage().newResponse', newResponse);

        if(get(newResponse, 'resourceType') === "Bundle"){
          logger.debug('Parsing a Bundle.')
          let entries = get(newResponse, 'entry', []);

          entries.forEach(function(entry){
            if(get(entry, 'resource.resourceType') === "Condition"){
              logger.trace('Found an condition', get(entry, 'resource'));

              if(!Conditions.findOne({id: get(entry, 'resource.id')})){
                let conditionId = Conditions.insert(get(entry, 'resource'), {validate: false, filter: false});
                logger.trace('Just received new condition: ' + conditionId);
    
                if(!get(entry, 'resource.id')){
                  entry.resource.id = conditionId;
                } 
                if(!get(entry, 'resource._id')){
                  entry.resource._id = conditionId;
                }
    
                conditionsArray.push(get(entry, 'resource'))  
              }
            }
          })        

          // setConditions(conditionsArray);  // this is mostly just to update the progress so people see things are loading
          conditionsArray = recursiveConditionQuery(fhirClient, newResponse, conditionsArray, callback)
        } 

        // setEncounters(conditionsArray);
        return conditionsArray;
      })
    } else {
      callback();
    }

    return recursiveResult;
  }




  async function recursiveProcedureQuery(fhirClient, searchResponse, proceduresArray, callback){
    logger.debug('recursiveProcedureQuery', fhirClient, searchResponse);
  
    let self = this;

    function hasNext(searchResponse){
      let result = false;
      if(get(searchResponse, 'link')){
        searchResponse.link.forEach(function(link){
          if(get(link, 'relation') === "next"){
            result = true;
          }
        })
      }
      return result;
    }

    let recursiveResult = null;
    if(hasNext(searchResponse)){
      logger.debug('Found a next link in the bundle.  Fetching...')
      recursiveResult = await fhirClient.nextPage(searchResponse)
      .then((newResponse) => {
        logger.trace('recursiveProcedureQuery().fhirClient.nextPage().newResponse', newResponse);

        if(get(newResponse, 'resourceType') === "Bundle"){
          logger.debug('Parsing a Bundle.')
          let entries = get(newResponse, 'entry', []);

          entries.forEach(function(entry){
            if(get(entry, 'resource.resourceType') === "Procedure"){
              logger.trace('Found an procedure', get(entry, 'resource'));

              if(!Procedures.findOne({id: get(entry, 'resource.id')})){
                let procedureId = Procedures.insert(get(entry, 'resource'), {validate: false, filter: false});
                logger.trace('Just received new procedure: ' + procedureId);
    
                if(!get(entry, 'resource.id')){
                  entry.resource.id = procedureId;
                } 
                if(!get(entry, 'resource._id')){
                  entry.resource._id = procedureId;
                }
    
                proceduresArray.push(get(entry, 'resource'))  
              }
            }
          })        

          // setProcedures(proceduresArray);  // this is mostly just to update the progress so people see things are loading
          proceduresArray = recursiveProcedureQuery(fhirClient, newResponse, proceduresArray, callback)
        } 

        // setEncounters(proceduresArray);
        return proceduresArray;
      })
    } else {
      callback();
    }

    return recursiveResult;
  }

  //-------------------------------------------------------------------
  // Methods

  async function fetchEncounterData(props, callback){
    logger.debug('Fetch encounter data from the following endpoint: ' + fhirServerEndpoint);


    let encountersArray = [];
    let searchOptions = { 
      resourceType: 'Encounter', 
      searchParams: { 
        date: []
      }
    };

    searchOptions.searchParams.date[0] = "ge" + selectedStartDate;
    searchOptions.searchParams.date[1] = "le" +  selectedEndDate;

    logger.trace('searchOptions', searchOptions)



    await fhirClient.search(searchOptions)
    .then((searchResponse) => {
      logger.debug('fetchEncounterData.searchResponse', searchResponse);

      if(searchResponse){
        let encountersArray = [];

        if(searchResponse.total){
          Session.set('totalEncountersDuringDateRange', searchResponse.total);
          Session.set('currentEncounterSearchset', searchResponse);
        }
      }

      if(get(searchResponse, 'resourceType') === "Bundle"){
        logger.debug('Parsing a Bundle.')
        logger.debug('Bundle linkUrl was: ' + get(searchResponse, "link[0].url"));
        Session.set('encounterUrl', get(searchResponse, "link[0].url"));

        let entries = get(searchResponse, 'entry', []);
        
        entries.forEach(function(entry){
          if(get(entry, 'resource.resourceType') === "Encounter"){

             // checking for duplicates along the way
            if(!Encounters.findOne({id: get(entry, 'resource.id')})){
              logger.trace('doesnt exist, upserting');

              let encounterId = Encounters.insert(get(entry, 'resource'), {validate: false, filter: false});
              logger.trace('Just received new encounter: ' + encounterId);
  
              if(!get(entry, 'resource.id')){
                entry.resource.id = encounterId;
              } 
              if(!get(entry, 'resource._id')){
                entry.resource._id = encounterId;
              }
  
              encountersArray.push(get(entry, 'resource'))
            }     
          }
        })        
      }

      encountersArray = recursiveEncounterQuery(fhirClient, searchResponse, encountersArray, function(error, result){
        logger.info("We just finished the recursive query and received the following result: " + result)
      });

      return encountersArray;
    })
    .then((encountersArray) => {
      // console.log('encountersArray', encountersArray);
      setEncounters(encountersArray);
      if(typeof callback === "function"){
        callback();
      }
      return encountersArray;
    })
    .catch((error) => {
      console.log(error)
    });
  }

  async function fetchConditionData(props, callback){
    logger.debug('Fetch condition data from the following endpoint: ' + fhirServerEndpoint);


    let conditionsArray = [];

    let searchOptions = { 
      resourceType: 'Condition',
      searchParams: {} 
    };

    let conditionsToSearchFor = [];
    let conditionsToSearchForString = "";
    
    // these are our toggles
    // http://www.snomed.org/news-and-events/articles/jan-2020-sct-intl-edition-release
    if(checkedFever){
      conditionsToSearchFor.push("386661006")
    }
    if(checkedCough){
      conditionsToSearchFor.push("49727002")
    }
    if(checkedDyspnea){
      conditionsToSearchFor.push("267036007")
    }
    if(checkedCovid19){
      conditionsToSearchFor.push("840539006")
      conditionsToSearchFor.push("840533007")
    }
    if(checkedSuspectedCovid19){
      conditionsToSearchFor.push("840544004")
      conditionsToSearchFor.push("840546002")

    }
    if(checkedSerumAntibodies){
      conditionsToSearchFor.push("840536004")
    }

    // we're being a bit sloppy with this algorithm because it needs to get out the door
    conditionsToSearchFor.forEach(function(snomedCode){
      // adding a comma after each snomed code
      conditionsToSearchForString = conditionsToSearchForString + snomedCode + ",";
    })
    if(conditionsToSearchFor.length > 0){
      // and then dropping the last comma;
      // blah, but it works
      searchOptions.searchParams.code = conditionsToSearchForString.substring(0, conditionsToSearchForString.length - 1);
    }


    searchOptions.searchParams["onset-date"] = [];
    searchOptions.searchParams["onset-date"][0] = "ge" + selectedStartDate;
    searchOptions.searchParams["onset-date"][1] = "le" +  selectedEndDate;

    logger.debug('searchOptions', searchOptions)

    await fhirClient.search(searchOptions)
    .then((searchResponse) => {
      logger.debug('fetchConditionData.searchResponse', searchResponse);

      if(searchResponse){
        let conditionsArray = [];

        if(searchResponse.total){
          Session.set('totalConditionsDuringDateRange', searchResponse.total);
          Session.set('currentConditionSearchset', searchResponse);
        }
      }

      if(get(searchResponse, 'resourceType') === "Bundle"){
        logger.debug('Parsing a Bundle.')
        logger.debug('Bundle linkUrl was: ' + get(searchResponse, "link[0].url"));
        Session.set('conditionUrl', get(searchResponse, "link[0].url"));

        let entries = get(searchResponse, 'entry', []);
        
        entries.forEach(function(entry){
          if(get(entry, 'resource.resourceType') === "Condition"){

             // checking for duplicates along the way
            if(!Conditions.findOne({id: get(entry, 'resource.id')})){
              logger.trace('doesnt exist, upserting');

              let conditionId = Conditions.insert(get(entry, 'resource'), {validate: false, filter: false});
              logger.trace('Just received new condition: ' + conditionId);
  
              if(!get(entry, 'resource.id')){
                entry.resource.id = conditionId;
              } 
              if(!get(entry, 'resource._id')){
                entry.resource._id = conditionId;
              }
  
              conditionsArray.push(get(entry, 'resource'))
            }     
          }
        })        
      }

      conditionsArray = recursiveConditionQuery(fhirClient, searchResponse, conditionsArray, function(error, result){
        logger.info("We just finished the recursive query and received the following result: " + result)
      });

      return conditionsArray;
    })
    .then((conditionsArray) => {
      // console.log('conditionsArray', conditionsArray);
      setConditions(conditionsArray);
      if(typeof callback === "function"){
        callback();
      }
      return conditionsArray;
    })
    .catch((error) => {
      console.log(error)
    });
  }

  async function fetchProcedureData(props, callback){
    logger.debug('Fetch procedure data from the following endpoint: ' + fhirServerEndpoint);


    let proceduresArray = [];
    let searchOptions = { 
      resourceType: 'Procedure', 
      searchParams: { 
        date: [],
        code: "371908008"
      }
    };


    let proceduresToSearchFor = [];
    let proceduresToSearchForString = "";
    
    // these are our toggles
    // http://www.snomed.org/news-and-events/articles/jan-2020-sct-intl-edition-release
    if(checkedVaccinated){
      proceduresToSearchFor.push("840534001")
    }
    if(checkedVentilator){
      proceduresToSearchFor.push("371908008")
    }
    if(checkedOxygenAdministration){
      proceduresToSearchFor.push("371908008")
    }


    // we're being a bit sloppy with this algorithm because it needs to get out the door
    proceduresToSearchFor.forEach(function(snomedCode){
      // adding a comma after each snomed code
      proceduresToSearchForString = proceduresToSearchForString + snomedCode + ",";
    })
    if(proceduresToSearchFor.length > 0){
      // and then dropping the last comma;
      // blah, but it works
      searchOptions.searchParams.code = proceduresToSearchForString.substring(0, proceduresToSearchForString.length - 1);
    }


    searchOptions.searchParams.date[0] = "ge" + selectedStartDate;
    searchOptions.searchParams.date[1] = "le" +  selectedEndDate;

    logger.trace('searchOptions', searchOptions)

    await fhirClient.search(searchOptions)
    .then((searchResponse) => {
      logger.debug('fetchProcedureData.searchResponse', searchResponse);

      if(searchResponse){
        let proceduresArray = [];

        if(searchResponse.total){
          Session.set('totalProceduresDuringDateRange', searchResponse.total);
          Session.set('currentProcedureSearchset', searchResponse);
        }
      }

      if(get(searchResponse, 'resourceType') === "Bundle"){
        logger.debug('Parsing a Bundle.')
        logger.debug('Bundle linkUrl was: ' + get(searchResponse, "link[0].url"));
        Session.set('procedureUrl', get(searchResponse, "link[0].url"));

        let entries = get(searchResponse, 'entry', []);
        
        entries.forEach(function(entry){
          if(get(entry, 'resource.resourceType') === "Procedure"){

             // checking for duplicates along the way
            if(!Procedures.findOne({id: get(entry, 'resource.id')})){
              logger.trace('doesnt exist, upserting');

              let procedureId = Procedures.insert(get(entry, 'resource'), {validate: false, filter: false});
              logger.trace('Just received new procedure: ' + procedureId);
  
              if(!get(entry, 'resource.id')){
                entry.resource.id = procedureId;
              } 
              if(!get(entry, 'resource._id')){
                entry.resource._id = procedureId;
              }
  
              proceduresArray.push(get(entry, 'resource'))
            }     
          }
        })        
      }

      proceduresArray = recursiveProcedureQuery(fhirClient, searchResponse, proceduresArray, function(error, result){
        logger.info("We just finished the recursive query and received the following result: " + result)
      });

      return proceduresArray;
    })
    .then((proceduresArray) => {
      // console.log('proceduresArray', proceduresArray);
      setProcedures(proceduresArray);
      if(typeof callback === "function"){
        callback();
      }
      return proceduresArray;
    })
    .catch((error) => {
      console.log(error)
    });
  }





  function fetchPatientsFromFhirArray(props, arrayOfResources){
    logger.info('GeocodingPage.fetchPatientsFromFhirArray()');

    let patientReference = "";
    let patientReferenceArray = [];
    let patientId = "";
    let newPatientId = "";
    let fetchedPatientResponse;

    logger.trace('fetchPatientsFromFhirArray.arrayOfResources' + arrayOfResources);
    
    if(Array.isArray(arrayOfResources)){
      arrayOfResources.forEach(async function(resource){
        newPatientId = "";
  
        if(get(resource, 'patient.reference')){
          patientReference = get(resource, 'patient.reference');
          patientId = FhirUtilities.pluckReferenceId(patientReference);
        } else if (get(resource, 'subject.reference')){
          patientReference = get(resource, 'subject.reference');
          patientId = FhirUtilities.pluckReferenceId(patientReference);
        }
  
        logger.debug('fetchPatientsFromFhirArray.encounters[i].patientId', patientId);
  
        fetchedPatientResponse = await fhirClient.read({ resourceType: 'Patient', id: patientId });
        logger.trace('fetchedPatientResponse', fetchedPatientResponse);
  
        if(fetchedPatientResponse){
          if(fetchedPatientResponse.resourceType === "Patient"){
            if(!Patients.findOne({id: fetchedPatientResponse.id})){
              newPatientId = Patients.insert(fetchedPatientResponse, {validate: false, filter: false});
              logger.verbose('Just received new patient: ' + newPatientId);
            }    
          } else if(fetchedPatientResponse.resourceType === "Bundle"){
            if(Array.isArray(fetchedPatientResponse.entry)){
              fetchedPatientResponse.entry.forEach(function(entry){
                if(get(entry, 'resource.resourceType') === "Patient"){
                  console.log('Searching for patient id: ' + get(entry, 'resource.id'));                
                  if(!Patients.findOne({id: get(entry, 'resource.id')})){
                    newPatientId = Patients.insert(get(entry, 'resource'), {validate: false, filter: false});
                    logger.verbose('Just added a new patient: ' + newPatientId);
                  } else {
                    console.log("Already found the patient?")
                  }
                }
              })
            }
          }
        }
      })   
    }
    if(typeof callback === "function"){
      callback();
    }
  }






  function handleStartDateChange(event, newDate){
    Session.set('fhirKitClientStartDate', moment(newDate).format("YYYY-MM-DD"));
    Session.set('lastUpdated', new Date())
  }

  function handleEndDateChange(event, newDate){
    Session.set('fhirKitClientEndDate', moment(newDate).format("YYYY-MM-DD"))
    Session.set('lastUpdated', new Date())
  }


  function handleFhirEndpointChange(event){
    logger.trace('handleFhirEndpointChange', event.target.value)

    if(event.target.value){
      // Session.set("fhirServerEndpoint", event.target.value)
      setFhirServerEndpoint(event.target.value)

      fhirClient = new Client({
        baseUrl: event.target.value
      });
    }
  }

  let containerStyle = {
    paddingLeft: '100px',
    paddingRight: '100px',
    marginBottom: '100px'
  };

  let patientTitle = 'Patients';
  let encountersTitle = 'Encounters';
  let conditionsTitle = 'Conditions';
  let proceduresTitle = 'Procedures';
  let locationsTitle = 'Locations';


  if(typeof Patients === "object"){
    patientTitle = patientCount + ' Patients';
  }

  if(typeof Encounters === "object"){
    encountersTitle = encounterCount + ' Encounters';
  }

  if(typeof Encounters === "object"){
    conditionsTitle = conditionCount + ' Conditions';
  }

  if(typeof Procedures === "object"){
    proceduresTitle = procedureCount + ' Procedures';
  }
  if(typeof Locations === "object"){
    locationsTitle = locationCount + ' Locations';
  }

  
  selectedStartDate = moment(selectedStartDate).format("YYYY-MM-DD");
  selectedEndDate = moment(selectedEndDate).format("YYYY-MM-DD");
    

  return (
    <PageCanvas id='fetchDataFromHospitalPage' headerHeight={158} >
      <MuiPickersUtilsProvider utils={MomentUtils} libInstance={moment} local="en">
        <Grid container spacing={3} >
          <Grid item xs={4}>
            <CardHeader 
                title="Step 4 - Geocode Addresses into Lat/Lng" 
                style={{fontSize: '100%'}} />
            <StyledCard id="geocodedLocationsCard" style={{minHeight: '240px' }}>
              <CardHeader 
                id="geocodedLocationsCount"
                title={locationsTitle}  
                style={{fontSize: '100%'}} />
              <CardContent style={{fontSize: '100%', paddingBottom: '28px'}}>
                <LocationsTable
                  id="geocodedLocationsTable"
                  locations={locations}
                  rowsPerPage={10}
                  count={locationCount}
              />
              </CardContent>
              <CardActions style={{display: 'inline-flex', width: '100%'}} >
                <Button id="clearLocationsBtn" color="primary" className={classes.button} onClick={clearLocations.bind(this)} >Clear</Button> 
                <Button id="generateGeoJsonBtn" color="primary" variant="contained" className={classes.button} onClick={generateGeoJson.bind(this)} >Generate GeoJson</Button> 
              </CardActions> 
            </StyledCard>
            {/* <CardHeader 
              title="Step 3 - Patient Demographics" 
              style={{fontSize: '100%'}} />           

            <StyledCard id="fetchedPatientsCard" >
              <CardHeader 
                id="patientCardCount"
                title={patientTitle}  
                style={{fontSize: '100%'}} />
              <CardContent style={{fontSize: '100%', paddingBottom: '28px'}}>
                <PatientTable
                  id="fetchedPatientsTable"
                  patients={patients}
                  hideIdentifier
                  hideMaritalStatus
                  rowsPerPage={10}
                  count={patientCount}
                  hideActionIcons
                  hideLanguage
                  hideCountry
                  showCounts={false}
                  hideActive
              />
              </CardContent>
              <CardActions style={{display: 'inline-flex', width: '100%'}} >
                <Button id="geocodePatientAddresses" color="primary" variant="contained" className={classes.button} onClick={handleGeocodeAddresses.bind(this)} >Geocode Addresses</Button> 
                <Button id="clearPatientsBtn" color="primary" className={classes.button} onClick={clearPatients.bind(this)} >Clear</Button> 
              </CardActions> 
            </StyledCard> */}
          </Grid>
          <Grid item xs={4}>
           <CardHeader 
              title="Step 5 - Generate Map Layer" 
              style={{fontSize: '100%'}} />
            <StyledCard id="geocodedLocationsCard" style={{minHeight: '240px',  maxHeight: '660px'}}>
              <CardHeader 
                id="geoJsonPreview"
                title="GeoJson"
                subheader={geoJsonLayerFeaturesCount ? geoJsonLayerFeaturesCount + ' Features' : ''}
                style={{fontSize: '100%'}} />
              <CardContent style={{fontSize: '100%', paddingBottom: '28px', overflowY: 'scroll', maxHeight: '500px'}}>
                
                <div style={{overflowY: 'scroll', maxHeight: '630px', width: '100%'}}>
                  <pre style={{overflow: 'scroll', maxHeight: '450px', width: '100%'}}>
                    { JSON.stringify(geoJsonLayer, null, 2) }
                  </pre>
                </div>
              </CardContent>
              <CardActions style={{display: 'inline-flex', width: '100%'}} >
                <Button id="clearGeoJson" color="primary" className={classes.button} onClick={clearGeoJson.bind(this)} >Clear</Button> 
              </CardActions> 
            </StyledCard>
          </Grid>
          <Grid item xs={4}>
           <CardHeader 
              title="Step 6 - Configure Map Options" 
              style={{fontSize: '100%'}} />
            <StyledCard id="optionsCard" style={{minHeight: '280px'}}>
              <CardHeader                 
                title="Map Options" 
                style={{fontSize: '100%'}} />
              <CardContent style={{fontSize: '100%', paddingBottom: '28px'}} >
                <Grid container style={{paddingBottom: '20px'}}>
                  <Grid item xs={6} style={{paddingRight: '10px'}}>
                    <TextField 
                      id="mapCenterAddress" 
                      label="Map Centrer" 
                      helperText="This should be an address.  We will geocode it." 
                      defaultValue="Chicago, IL"
                      disabled
                      fullWidth />
                  </Grid>
                  <Grid item xs={6} style={{paddingLeft: '10px'}}>
                    <TextField 
                      id="searchProximity" 
                      label="Search Proximity" 
                      helperText="This should be a number (in miles)." 
                      defaultValue={50}
                      disabled
                      fullWidth />
                  </Grid>
                </Grid>

                <Typography gutterBottom>
                  Opacity
                </Typography>
                <Slider
                  defaultValue={50}
                  //getAriaValueText={valuetext}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  step={10}
                  marks
                  min={0}
                  max={100}
                  disabled
                />

                <Typography gutterBottom>
                  Radius
                </Typography>
                <Slider
                  defaultValue={10}
                  //getAriaValueText={valuetext}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  step={10}
                  marks
                  min={0}
                  max={100}
                  disabled
                />

              </CardContent>
                <CardActions style={{display: 'inline-flex', width: '100%'}} >
                  <Button id="geocodeCentroidButton" color="primary" className={classes.button} onClick={geocodeCentroid.bind(this)} >Geocode</Button> 
                </CardActions> 
            </StyledCard>
          </Grid>

        </Grid>   
      </MuiPickersUtilsProvider>            
    </PageCanvas>
  );
}

export default GeocodingPage;