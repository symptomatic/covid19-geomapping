import React from 'react';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';

import { Button } from '@material-ui/core';

import { get } from 'lodash';
import JSON5 from 'json5';

import LocationMethods from '../lib/LocationMethods';

let apiKey = get(Meteor, 'settings.public.interfaces.default.auth.username', '');
let usePseudoCodes = get(Meteor, 'settings.public.usePseudoCodes', false);
let fhirBaseUrl = get(Meteor, 'settings.public.interfaces.default.channel.endpoint', false);


// =========================================================================================
// HELPER FUNCTIONS


// function isFhirServerThatRequiresApiKey(){
//   if(["https://syntheticmass.mitre.org/v1/fhir"].includes(get(Meteor, 'settings.public.interfaces.default.channel.endpoint'))){
//     return true;
//   } else {
//     return false
//   }
// }


//========================================================================================================

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
      color: theme.appBarTextColor,
      marginLeft: '20px',
      marginTop: '10px'
    },
    east_button: {
      cursor: 'pointer',
      justifyContent: 'left',
      color: theme.appBarTextColor,
      right: '20px',
      marginTop: '15px',
      position: 'absolute'
    }
  }));

//============================================================================================================================
// FETCH

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
      <Button onClick={ epaToxicInventory.bind() } className={ buttonClasses.button }>
        Sample Data
      </Button>      
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
        console.log('result', result)
      }
    });
  }
  function clearHospitals(){
    console.log('Clearing hospitals...');
    HospitalLocations.remove({});
  }
  return (
    <MuiThemeProvider theme={muiTheme} >
      <Button onClick={ handleInitChicagoHospitals.bind(this) } className={ buttonClasses.west_button }>
        Init Chicago Hospitals
      </Button>
      <Button onClick={ handleInitUnitedStatesHospitalsServer.bind(this) } className={ buttonClasses.west_button }>
        Init U.S. Hospital Server Index
      </Button>      
      <Button onClick={ handleInitUnitedStatesHospitalsClient.bind(this) } className={ buttonClasses.west_button }>
        Load U.S. Hospital on Client
      </Button>      
      <Button onClick={ clearHospitals.bind() } className={ buttonClasses.east_button }>
        Clear Hospitals
      </Button>      
    </MuiThemeProvider>
  );
}

