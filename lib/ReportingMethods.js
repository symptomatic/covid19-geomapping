

import { get } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Measures, MeasureReports } from 'meteor/clinical:hl7-fhir-data-infrastructure';

import screeningMeasure from '../valuesets/Measure-ScreeningRate-example';
import totalVentilatorsMeasure from '../valuesets/Measure-TotalVentilators';
import totalVentilatorsMeasureReport from '../valuesets/MeasureReport-TotalVentilators';

ReportingMethods = {
  initializeSampleMeasure: function(){
    Measures.insert(screeningMeasure, {filter: false, validate: false});
    Measures.insert(totalVentilatorsMeasure, {filter: false, validate: false});
  },
  initializeSampleMeasureReport: function(){
    MeasureReports.insert(totalVentilatorsMeasureReport, {filter: false, validate: false});
  }
}

export default ReportingMethods;