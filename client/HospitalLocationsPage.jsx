import { 
  Divider,
  Card,
  Checkbox,
  CardHeader,
  CardContent,
  Button,
  Tab, 
  Tabs,
  Typography,
  Box
} from '@material-ui/core';

import { StyledCard, PageCanvas } from 'fhir-starter';

import { LocationsTable, HospitalLocations, LayoutHelpers } from 'meteor/clinical:hl7-fhir-data-infrastructure';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import React  from 'react';
import { ReactMeteorData, useTracker } from 'meteor/react-meteor-data';

import { get } from 'lodash';



//=============================================================================================================================================
// GLOBAL THEMING

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

// This is necessary for the Material UI component render layer
let theme = {
  primaryColor: "rgb(108, 183, 110)",
  primaryText: "rgba(255, 255, 255, 1) !important",

  secondaryColor: "rgb(108, 183, 110)",
  secondaryText: "rgba(255, 255, 255, 1) !important",

  cardColor: "rgba(255, 255, 255, 1) !important",
  cardTextColor: "rgba(0, 0, 0, 1) !important",

  errorColor: "rgb(128,20,60) !important",
  errorText: "#ffffff !important",

  appBarColor: "#f5f5f5 !important",
  appBarTextColor: "rgba(0, 0, 0, 1) !important",

  paperColor: "#f5f5f5 !important",
  paperTextColor: "rgba(0, 0, 0, 1) !important",

  backgroundCanvas: "rgba(255, 255, 255, 1) !important",
  background: "linear-gradient(45deg, rgb(108, 183, 110) 30%, rgb(150, 202, 144) 90%)",

  nivoTheme: "greens"
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
    primary: {
      main: theme.primaryColor,
      contrastText: theme.primaryText
    },
    secondary: {
      main: theme.secondaryColor,
      contrastText: theme.errorText
    },
    appBar: {
      main: theme.appBarColor,
      contrastText: theme.appBarTextColor
    },
    cards: {
      main: theme.cardColor,
      contrastText: theme.cardTextColor
    },
    paper: {
      main: theme.paperColor,
      contrastText: theme.paperTextColor
    },
    error: {
      main: theme.errorColor,
      contrastText: theme.secondaryText
    },
    background: {
      default: theme.backgroundCanvas
    },
    contrastThreshold: 3,
    tonalOffset: 0.2
  }
});




//=============================================================================================================================================
// MAIN COMPONENT

export function HospitalLocationsPage(props){

  let data = {
    style: {
      opacity: Session.get('globalOpacity'),
      tab: {
        borderBottom: '1px solid lightgray',
        borderRight: 'none'
      },
      page: {
        position: 'fixed',
        top: '0px',
        left: '0px',
        height: Session.get('appHeight'),
        width: Session.get('appWidth')
      },
      canvas: {
        left: '0px',
        top: '0px',
        position: 'fixed'
      }
    },
    locationSearchFilter: Session.get('locationSearchFilter'),
    selectedLocationId: Session.get('selectedLocationId'),
    currentLocation: null,
    fhirVersion: Session.get('fhirVersion'),
    hospitalLocations: []
  };

  data.style.page.height = useTracker(function(){
    return Session.get('appHeight');
  }, [])
  data.style.page.width = useTracker(function(){
    return Session.get('appWidth');
  }, [])

  data.locationSearchFilter = useTracker(function(){
    return Session.get('locationSearchFilter');
  }, [])
  data.selectedLocationId = useTracker(function(){
    return Session.get('selectedLocationId');
  }, [])
  data.hospitalLocations = useTracker(function(){
    return HospitalLocations.find().fetch();
  }, [])



  let headerHeight = LayoutHelpers.calcHeaderHeight();

  const rowsPerPage = get(Meteor, 'settings.public.defaults.rowsPerPage', 20);         
        
  return (
    <PageCanvas id="locationsPage" headerHeight={headerHeight} >
      <MuiThemeProvider theme={muiTheme} >
        <StyledCard height="auto" scrollable={true} margin={20} >
          <CardHeader
            title="Hospital Locations"
          />
          <CardContent>
          <LocationsTable 
              locations={ data.hospitalLocations}
              rowsPerPage={rowsPerPage}
              count={ data.hospitalLocations.length}      
            />
          </CardContent>
        </StyledCard>
      </MuiThemeProvider>
    </PageCanvas>
  );
}




export default HospitalLocationsPage;