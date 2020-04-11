import React, { useState } from 'react';

import { makeStyles, withStyles } from '@material-ui/core/styles';

import { 
  Button,
  FormControl,
  InputLabel,
  Input
} from '@material-ui/core';

import Grid from '@material-ui/core/Grid';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import { get, has } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';
import JSON5 from 'json5';

import moment from 'moment';

import {github} from 'react-icons-kit/icomoon/github'
import { Icon } from 'react-icons-kit'

import { PageCanvas, StyledCard, PatientTable } from 'material-fhir-ui';
import { useTracker } from './Tracker';

function DynamicSpacer(props){
  return <br className="dynamicSpacer" style={{height: '40px'}}/>;
}

//==============================================================================================
// THEMING

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft:  '15px',
    marginRight: '15px'
  },
  githubIcon: {
    margin: '0px'
  },
}));

//==============================================================================================
// MAIN COMPONENT

function HospitalSearchDialog(props){

  const classes = useStyles();
  
  let [city, setCity] = useState("");
  let [stateAbbreviation, setStateAbbreviation] = useState("");

  function handleChangeCity(event){
    console.log('Updating the city to search for', event.currentTarget.value);
    setCity(event.currentTarget.value);
  }
  function handleChangeState(event){
    console.log('Updating the state to search for', event.currentTarget.value);
    setStateAbbreviation(event.currentTarget.value);
  }
  function handleChangeZip(event){
    console.log('Updating the zip to search for', event.currentTarget.value);
  }
  function handleFetchCity(){
    console.log('Lets try fetching the hospitals in the following city: ', city);
    Meteor.call('fetchHospitalsByCity', city, function(error, hospitals){
      console.log('Received a response', hospitals)
      if(Array.isArray(hospitals)){
        hospitals.forEach(function(hospital){
          HospitalLocations.upsert({id: hospital.id}, {$set: hospital})
        })
      }
    })
  }
  function handleFetchState(event){
    console.log('Lets try fetching the hospitals in the following city: ', stateAbbreviation);
    Meteor.call('fetchHospitalsByState', stateAbbreviation, function(error, hospitals){
      console.log('Received a response', hospitals)
      hospitals.forEach(function(hospital){
        HospitalLocations.upsert({id: hospital.id}, {$set: hospital})
      })
    })
  }

  return (
    <DialogContent dividers={scroll === 'paper'} style={{minWidth: '600px', fontSize: '120%'}}>

      <FormControl style={{width: '100%', marginTop: '20px', marginBottom: '20px'}}>
        <InputLabel>Search City</InputLabel>
        <Input
          id="citySearchInput"
          name="citySearchInput"
          placeholder="Chicago"
          // helperText='Please enter the name of a city.  '
          fullWidth
          onChange={handleChangeCity}
          fullWidth
        />
      </FormControl>
      <Button 
          id='fetchCityBtn' 
          color='primary'
          variant='contained'
          onClick={ handleFetchCity.bind(this) }
        >Fetch Hospitals</Button> 

      <FormControl style={{width: '100%', marginTop: '60px', marginBottom: '20px'}}>
        <InputLabel>Search State</InputLabel>
        <Input
          id="stateSearchInput"
          name="stateSearchInput"
          placeholder="Chicago"
          placeholder="IL"
          // helperText='Please enter the abbreviation of a US state.'
          fullWidth
          onChange={handleChangeState}
        />
      </FormControl>
      <Button 
          id='fetchStateBtn' 
          color='primary'
          variant='contained'
          onClick={ handleFetchState.bind(this) }
        >Fetch Hospitals</Button> 

    </DialogContent>
  );
}




export default HospitalSearchDialog;