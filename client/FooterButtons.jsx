import React from 'react';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';

import { Button } from '@material-ui/core';

import { get } from 'lodash';
import JSON5 from 'json5';

import { HospitalLocations } from 'meteor/clinical:hl7-fhir-data-infrastructure';

import LocationMethods from '../lib/LocationMethods';



//========================================================================================================
// Theming

import {
  fade,
  ThemeProvider,
  MuiThemeProvider,
  withStyles,
  makeStyles,
  createMuiTheme,
  useTheme
} from '@material-ui/core/styles';

  // Global Theming 
  // This is necessary for the Material UI component render layer
  let theme = {
    appBarColor: "#f5f5f5 !important",
    appBarTextColor: "rgba(0, 0, 0, 1) !important",
  }

  // if we have a globally defined theme from a settings file
  if(get(Meteor, 'settings.public.theme.palette')){
    theme = Object.assign(theme, get(Meteor, 'settings.public.theme.palette'));
  }

  const muiTheme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
    palette: {
      appBar: {
        main: theme.appBarColor,
        contrastText: theme.appBarTextColor
      },
      contrastThreshold: 3,
      tonalOffset: 0.2
    }
  });

const useTabStyles = makeStyles(theme => ({
  west_button: {
    cursor: 'pointer',
    justifyContent: 'left',
    color: theme.palette.appBar.contrastText,
    marginLeft: '20px',
    marginTop: '10px'
  },
  east_button: {
    cursor: 'pointer',
    justifyContent: 'left',
    color: theme.palette.appBar.contrastText,
    right: '20px',
    marginTop: '15px',
    position: 'absolute'
  }
}));



//============================================================================================================================
// Map Buttons

export function MapButtons(props){
  const buttonClasses = useTabStyles();

  function epaToxicInventory(){
    console.log('epaToxicInventory')
    var geodataUrl = 'https://data.cityofchicago.org/resource/6zsd-86xi.geojson';
    HTTP.get(geodataUrl, {}, function(error, response){
      if(error){console.log('error', error)}
      if(response){
        Session.set('geoJsonLayer', JSON.parse(get(response, 'content')));
      }
    })
  }
  return (
    <MuiThemeProvider theme={muiTheme} >
      <Button onClick={ epaToxicInventory.bind() } className={ buttonClasses.west_button }>
        Sample Data (Chicago Crime)  
      </Button>      
    </MuiThemeProvider>
  );
}


//============================================================================================================================
// Hospitals Map 


export function HospitalsMapButtons(props){
  const buttonClasses = useTabStyles();

  return (
    <MuiThemeProvider theme={muiTheme} >
      <div></div>
      {/* <Button onClick={ epaToxicInventory.bind() } className={ buttonClasses.button }>
        Sample Data
      </Button>       */}
    </MuiThemeProvider>
  );
}



//============================================================================================================================
// FETCH

export function HospitalLocationButtons(props){
  const buttonClasses = useTabStyles();

  function handleInitChicagoHospitals(){
    console.log('User requested to initialize Chicago area Hospitals!');

    LocationMethods.initializeHospitals();
  }
  function handleInitUnitedStatesHospitalsServer(){
    console.log('User requested to initialize U.S. Hospitals Index on the server!');
    Meteor.call('initializeHospitalIndex');
  }
  function handleInitUnitedStatesHospitalsClient(){
    console.log('User requested to load U.S. Hospitals on the client!');
    Meteor.call('fetchAllHospitalLocations', function(error, result){
      if(error) console.log('error', error)
      if(result){
        console.log('Received a response from the Fetch All query.')
        if(Array.isArray(result)){
          result.forEach(function(location, index){
            HospitalLocations.upsert({id: location.id}, {$set: location});
            if(index % 10 === 0){
              Session.set('lastUpdated', new Date());
            }
          })
        }
      }
    });
  }
  function clearHospitals(){
    console.log('Clearing hospitals...');
    HospitalLocations.remove({});
  }
  function toggleHospitalSearchDialog(){
    console.log('Toggle dialog open/close.')
    Session.set('mainAppDialogJson', false);
    Session.set('mainAppDialogTitle', "Search Hospital Index");
    Session.set('mainAppDialogComponent', "HospitalSearchDialog");
    Session.set('lastUpdated', new Date())
    Session.toggle('mainAppDialogOpen');
  }
  return (
    <MuiThemeProvider theme={muiTheme} >
      {/* <Button onClick={ handleInitChicagoHospitals.bind(this) } className={ buttonClasses.west_button }>
        Init Chicago Hospitals
      </Button> */}
      {/* <Button onClick={ handleInitUnitedStatesHospitalsServer.bind(this) } className={ buttonClasses.west_button }>
        Init U.S. Hospital Server Index
      </Button>       */}
      {/* <Button onClick={ handleInitUnitedStatesHospitalsClient.bind(this) } className={ buttonClasses.west_button }>
        Load U.S. Hospital on Client
      </Button>       */}
      <Button onClick={ toggleHospitalSearchDialog.bind(this) } className={ buttonClasses.west_button }>
        Search Hospitals
      </Button>      



      <Button onClick={ clearHospitals.bind() } className={ buttonClasses.east_button }>
        Clear Hospitals
      </Button>      
    </MuiThemeProvider>
  );
}

