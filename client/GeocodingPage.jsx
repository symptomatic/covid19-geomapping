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

import { 
  FormControl,
  InputLabel,
  Input
} from '@material-ui/core';

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

import { Patients, Encounters, Locations, HospitalLocations, Observations, EncountersTable, ConditionsTable, ProceduresTable, LocationsTable } from 'meteor/clinical:hl7-fhir-data-infrastructure';

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
  const classes = useStyles();

  const rowsPerPage = get(Meteor, 'settings.public.defaults.rowsPerPage', 25);

  let [patients,   setPatients]   = useState([]);
  let [encounters, setEncounters] = useState([]);
  let [conditions, setConditions] = useState([]);
  let [procedures, setProcedures] = useState([]);
  let [locations,  setLocations]  = useState([]);
  let [hospitalLocations, setHospitalLocations] = useState([]);  

  let [centroidAddress, setCentroidAddress] = useState("Chicago, IL");
  let [centroidLatitude, setCentroidLatitude] = useState(41.8781136);
  let [centroidLongitude, setCentroidLongitude] = useState(-87.6297982);

  let [displayHeatmapControls, setDisplayHeatmapControls] = useState(false);
  let [showLabels, setShowLabels] = useState(false);
  let [showMarkers, setShowMarkers] = useState(false);

  //-------------------------------------------------------------------
  // Tracking


  // centroidAddress = useTracker(function(){    
  //   return Session.get('centroidAddress')
  // }, [props.lastUpdated]);  
  // centroidLatitude = useTracker(function(){    
  //   return Session.get('centroidLatitude')
  // }, [props.lastUpdated]);  
  // centroidLongitude = useTracker(function(){    
  //   return Session.get('centroidLongitude')
  // }, [props.lastUpdated]);  
  // displayHeatmapControls = useTracker(function(){    
  //   return Session.get('displayHeatmap')
  // }, [props.lastUpdated]);  
  // showMarkers = useTracker(function(){    
  //   return Session.get('displayMarkers')
  // }, [props.lastUpdated]);  
  // showLabels = useTracker(function(){    
  //   return Session.get('displayLabels')
  // }, [props.lastUpdated]);  



  let locationsCursor;
  locationsCursor = useTracker(function(){
    return Locations.find();
  }, [props.lastUpdated]); 
  if(locationsCursor){
    locations = locationsCursor.fetch();
  }

  let hospitalLocationsCursor;
  hospitalLocationsCursor = useTracker(function(){
    return HospitalLocations.find();
  }, [props.lastUpdated]); 
  if(hospitalLocationsCursor){
    hospitalLocations = hospitalLocationsCursor.fetch();
  }
  

  let locationCount = 0;
  locationCount = useTracker(function(){    
    return Locations.find().count()
  }, []);  

  let hospitalLocationCount = 0;
  hospitalLocationCount = useTracker(function(){    
    return HospitalLocations.find().count()
  }, []);  


  let geoJsonLayer = 0;
  let geoJsonLayerFeaturesCount = 0;
  geoJsonLayer = useTracker(function(){    
    return Session.get('geoJsonLayer')
  }, [props.lastUpdated]);  

  if(geoJsonLayer && Array.isArray(geoJsonLayer.features)){
    geoJsonLayerFeaturesCount = geoJsonLayer.features.length
  }




  //-------------------------------------------------------------------
  // Toggle Methods

  function handleToggleMarkers(){
    logger.warn('GeocodingPage.handleToggleMarkers()');

    if(showMarkers){
      setShowMarkers(false);
      Session.set('displayMarkers', false);
    } else {
      setShowMarkers(true);
      Session.set('displayMarkers', true);
    }
  }
  function handleToggleLabels(){
    logger.warn('GeocodingPage.handleToggleLabels()');

    if(showLabels){
      setShowLabels(false);
      Session.set('displayLabels', false);
    } else {
      setShowLabels(true);
      Session.set('displayLabels', true);
    }
  }
  function handleToggleHeatmapControls(){
    logger.warn('GeocodingPage.handleToggleHeatmapControls()');

    if(displayHeatmapControls){
      setDisplayHeatmapControls(false);
      Session.set('displayHeatmap', false);
    } else {
      setDisplayHeatmapControls(true);
      Session.set('displayHeatmap', true);
    }
  }


  //-------------------------------------------------------------------
  // Slider Methods

  function handleChangeOpacity(event, value){
    console.log('handleChangeOpacity', value)

    Session.set('heatmapOpacity', value)
  }
  function handleChangeRadius(event, value){
    console.log('handleChangeRadius', value)

    Session.set('heatmapRadius', value)
  }
  function handleChangeMaxIntensity(event, value){
    console.log('handleChangeMaxIntensity', value)

    Session.set('heatmapMaxIntensity', value)
  }

  //-------------------------------------------------------------------
  // Button Methods

  function handleChangeAddress(event){
    logger.warn('GeocodingPage.handleChangeAddress()');
    
    setCentroidAddress(event.currentTarget.value);
  }

  function handleGeocodeCentroid(){
    console.log('Geocoding the map centroid: ', centroidAddress);
    Meteor.call('geocodeAddress', {
      line: [centroidAddress]
    }, function(error, result){
      console.log('Received a response', result)      

      setCentroidLongitude(get(result[0], 'longitude'));
      setCentroidLatitude(get(result[0], 'latitude'));

      Session.set('centroidLatitude', get(result[0], 'latitude'))
      Session.set('centroidLongitude', get(result[0], 'longitude'))
    })
  }





  function clearLocations(){
    logger.warn('GeocodingPage.clearLocations()');
    Locations.remove({});
  }
  function clearGeoJson(){
    logger.warn('GeocodingPage.clearGeoJson()');
    Session.set('geoJsonLayer', "")
  }

  function generateGeoJson(collectionName){
    logger.warn('Generating geojson layer from the ' + collectionName + ' collection.');

    let newGeoJson = {
      "type": "FeatureCollection",
      "features": []
    }

    let count = 0;
    if(collectionName === "HospitalLocations"){
      HospitalLocations.find().forEach(function(location){
        count++;
  
        if(get(location, 'position.longitude') && get(location, 'position.latitude')){
          let newFeature = { 
            "type": "Feature", 
            "properties": { 
              "id": get(location, 'id', count.toString()),                 
              "primary_type": "",                           
              "name": get(location, 'name'),                    
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
    } else {
      let proximityCount = Locations.find({_location: {$near: {
        $geometry: {
          type: 'Point',
          coordinates: [-88.0020589, 42.01136169999999]
        },
        // Convert [mi] to [km] to [m]
        $maxDistance: 50 * 1.60934 * 1000
      }}}).count();
  
      console.log('Found ' + proximityCount + ' locations within 50 miles of the search origin.')
  
      
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
  }


  //-------------------------------------------------------------------
  // Methods


  let containerStyle = {
    paddingLeft: '100px',
    paddingRight: '100px',
    marginBottom: '100px'
  };

  let locationsTitle = 'Building Locations';
  let hospitalLocationsTitle = 'Hospital Locations';


  if(typeof Locations === "object"){
    locationsTitle = locationCount + ' Locations';
  }

  if(typeof HospitalLocations === "object"){
    hospitalLocationsTitle = hospitalLocationCount + ' Hospital Locations';
  }
  
  let locationsCard;
  if(locationCount > 0){
    locationsCard = <StyledCard id="geocodedLocationsCard" style={{minHeight: '240px', marginBottom: '40px' }}>
      <CardHeader 
        id="geocodedLocationsCount"
        title={locationsTitle}  
        style={{fontSize: '100%'}} />
      <CardContent style={{fontSize: '100%', paddingBottom: '28px'}}>
        <LocationsTable
          id="geocodedLocationsTable"
          locations={locations}
          rowsPerPage={10}
          hideType={true}
          hideName={true}
          hideCountry={true}
          hideCity={true}
          hideState={true}
          hidePostalCode={true}
          count={locationCount}
        />
      </CardContent>
      <CardActions style={{display: 'inline-flex', width: '100%'}} >
        <Button id="clearLocationsBtn" color="primary" className={classes.button} onClick={clearLocations.bind(this)} >Clear</Button> 
        <Button id="generateGeoJsonBtn" color="primary" variant="contained" className={classes.button} onClick={generateGeoJson.bind(this, 'Locations')} >Generate GeoJson</Button> 
      </CardActions> 
    </StyledCard>
  }

  let hospitalLocationsCard;
  if(hospitalLocationCount > 0){
    hospitalLocationsCard = <StyledCard id="geocodedLocationsCard" style={{minHeight: '240px' }}>
      <CardHeader 
        id="geocodedLocationsCount"
        title={hospitalLocationsTitle}  
        style={{fontSize: '100%'}} />
      <CardContent style={{fontSize: '100%', paddingBottom: '28px'}}>
        <LocationsTable
          id="geocodedLocationsTable"
          locations={hospitalLocations}
          rowsPerPage={10}
          count={hospitalLocationCount}
          hideAddress={true}
          hideCountry={true}
          hideType={true}
          hideCity={true}                  
        />
      </CardContent>
      <CardActions style={{display: 'inline-flex', width: '100%'}} >
        <Button id="clearLocationsBtn" color="primary" className={classes.button} onClick={clearLocations.bind(this)} >Clear</Button> 
        <Button id="generateGeoJsonBtn" color="primary" variant="contained" className={classes.button} onClick={generateGeoJson.bind(this, 'HospitalLocations')} >Generate GeoJson</Button> 
      </CardActions> 
    </StyledCard>
  }

  let noLocationsCard;
  if((locationCount === 0) && (hospitalLocationCount === 0)){
    noLocationsCard = <StyledCard style={{minHeight: '200px', marginBottom: '40px'}} disabled>
      <CardContent style={{fontSize: '100%', paddingBottom: '28px', paddingTop: '50px', textAlign: 'center'}}>
        <CardHeader 
          title="No Location Data"       
          subheader="Please query the FHIR server or hospital index for Location data."
          style={{fontSize: '100%', whiteSpace: 'nowrap'}} />
            
      </CardContent>
    </StyledCard>
  }

  let heatmapControlsCard;
  if(displayHeatmapControls){
    heatmapControlsCard = <StyledCard id="heatmapControlsCard" style={{marginBottom: '40px'}}>
      <CardHeader                 
        title="Heatmap Controls" 
        style={{fontSize: '100%'}} />
      <CardContent style={{fontSize: '100%', paddingBottom: '28px'}} >
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
          onChange={handleChangeOpacity}
        />
        <br />
        <br />

        <Typography gutterBottom>
          Radius
        </Typography>
        <Slider
          defaultValue={50}
          //getAriaValueText={valuetext}
          aria-labelledby="discrete-slider"
          valueLabelDisplay="auto"
          step={10}
          marks
          min={0}
          max={200}
          onChange={handleChangeRadius.bind(this)}
        />
        <br />
        <br />

        <Typography gutterBottom>
          Max Intensity
        </Typography>
        <Slider
          defaultValue={10}
          //getAriaValueText={valuetext}
          aria-labelledby="discrete-slider"
          valueLabelDisplay="auto"
          step={2}
          marks
          min={0}
          max={50}
          onChange={handleChangeMaxIntensity}
        />

      </CardContent>
        <CardActions style={{display: 'inline-flex', width: '100%'}} >
          {/* <Button id="geocodeCentroidButton" color="primary" className={classes.button} onClick={handleGeocodeCentroid} >Geocode Map Center</Button>  */}
        </CardActions> 
    </StyledCard>
  }


  return (
    <PageCanvas id='geocodingPage' headerHeight={158} >
      <MuiPickersUtilsProvider utils={MomentUtils} libInstance={moment} local="en">
        <Grid container spacing={3} >
          <Grid item xs={4}>
            <CardHeader 
                title="Step 4 - Geocode Addresses into Lat/Lng" 
                style={{fontSize: '100%'}} />
            
            { locationsCard }
            { hospitalLocationsCard }
            { noLocationsCard }

          </Grid>
          <Grid item xs={4}>
           <CardHeader 
              title="Step 5 - Generate Map Layer" 
              style={{fontSize: '100%'}} />
            <StyledCard id="geocodedLocationsCard" style={{minHeight: '200px',  maxHeight: '660px'}}>
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
            <StyledCard id="optionsCard" style={{marginBottom: '40px'}}>
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
                      defaultValue={centroidAddress}
                      onChange={ handleChangeAddress }         
                      fullWidth />
                    <Grid container style={{marginTop: '20px', width: '100%'}}>
                      <Grid item xs={6} style={{paddingRight: '10px'}}>
                        <TextField 
                          id="mapCenterAddress" 
                          label="Latitude" 
                          value={centroidLatitude}
                          fullWidth
                          disabled
                          />                        
                      </Grid>
                      <Grid item xs={6} style={{paddingLeft: '10px'}}>
                        <TextField 
                          id="searchProximity" 
                          label="Longitude" 
                          value={centroidLongitude} 
                          disabled                     
                          fullWidth />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={6} style={{paddingLeft: '10px'}}>
                    <TextField 
                      id="searchProximity" 
                      label="Search Proximity" 
                      helperText="This should be a number (in miles)." 
                      defaultValue={50}                      
                      fullWidth
                      style={{paddingBottom: '30px'}}
                      />

                    <FormControlLabel                
                      control={<Checkbox checked={showMarkers} onChange={handleToggleMarkers.bind(this)} name="showMarkersToggle" />}
                      label="Markers"
                    />
                    <FormControlLabel                
                      control={<Checkbox checked={showLabels} onChange={handleToggleLabels.bind(this)} name="showLabelsToggle" />}
                      label="Labels"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={displayHeatmapControls} onChange={handleToggleHeatmapControls.bind(this)} name="displayHeatmapToggle" />}
                      label="Heatmap"
                    />

                  </Grid>
                </Grid>
              </CardContent>
              <CardActions style={{width: '100%'}} >
                <Button id="geocodeCentroidButton" color="primary" className={classes.button} onClick={handleGeocodeCentroid} >Geocode Map Center</Button> 
              </CardActions> 
            </StyledCard>

            { heatmapControlsCard }
          </Grid>

        </Grid>   
      </MuiPickersUtilsProvider>            
    </PageCanvas>
  );
}

export default GeocodingPage;