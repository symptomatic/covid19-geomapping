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

import { StyledCard, PageCanvas } from 'material-fhir-ui';

import { LocationsTable, HospitalLocations } from 'meteor/clinical:hl7-fhir-data-infrastructure';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import React  from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin  from 'react-mixin';

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
// TABS

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}


//=============================================================================================================================================
// MAIN COMPONENT

export class HospitalLocationsPage extends React.Component {
  getMeteorData() {
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
      tabIndex: Session.get('locationPageTabIndex'),
      locationSearchFilter: Session.get('locationSearchFilter'),
      selectedLocationId: Session.get('selectedLocationId'),
      currentLocation: null,
      fhirVersion: Session.get('fhirVersion'),
      hospitalLocations: HospitalLocations.find().fetch(),
      hospitalLocationsCount: HospitalLocations.find().count()
    };

    
    if(process.env.NODE_ENV === "test") console.log("HospitalLocationsPage[data]", data);
    return data;
  }

  render() {
    var self = this;
    var markers = [];

    let headerHeight = 64;
    if(get(Meteor, 'settings.public.defaults.prominantHeader', false)){
      headerHeight = 128;
    }

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
                locations={this.data.hospitalLocations}
                rowsPerPage={rowsPerPage}
                count={this.data.hospitalLocationsCount}      
              />
            </CardContent>
          </StyledCard>
        </MuiThemeProvider>
      </PageCanvas>
    );
  }
}



ReactMixin(HospitalLocationsPage.prototype, ReactMeteorData);

export default HospitalLocationsPage;