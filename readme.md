# COVID19 on FHIR Hackathon  

This project implements [HL7 SANER - Situation Awareness for Novel Epidemic Response](https://github.com/AudaciousInquiry/saner-ig), and was submitted to the [Datavant Pandemic Response Hackathon](https://datavant.com/pandemic-response-hackathon/) and the [MIT Covid19 Challenge](https://covid19challenge.mit.edu/).  

In particular, this package is responsible for geocoding FHIR Patient demographics into Latitude/Longitude using FHIR Location and then rendering a geojson data layer for use with Google Maps and other GIS applications.  This project has full programmtic access to the Google Maps API, including markers, heatmaps, reverse geocoding, routing, and many other features.  The following screenshot illustrates it's ability to display (synthetic) COVID19 patient address data in a heatmap.  Data in the screenshot was generated with the Synthea patient population simulator.  

![Covid19Geomapping-SyntheaHeatmap](https://raw.githubusercontent.com/symptomatic/covid19-on-fhir/master/screenshots/Covid19Geomapping-SyntheaHeatmap.png)


#### Prerequisites  
This project requires the following platform libraries and projects:  

- [Meteor Javascript Framework](https://www.meteor.com/)  
- [Node on FHIR](https://github.com/symptomatic/node-on-fhir)  
- [Covid19 on FHIR](https://github.com/symptomatic/covid19-on-fhir)  
- [Synthea - Covid19 Module](https://github.com/synthetichealth/synthea/issues/679)  


#### Design Documents  
The primary goal behind this hackathon is to stand up a COVID19 specific version of the Epidemiology on FHIR module, so we can map hospital EHR data onto Google Maps.  Primary workflow will look something like this:

- Query hospital FHIR compliant EHRs for COVID19 related LOINC and SNOMED codes.  
- Do patient demographic lookups with the received patient Ids to determine home addresses.  
- Geocode the home addresses into latitude/longitude, and assemble into a geojson file.  
- Display housing markers on Google Maps.  
- Display a heatmap on Google Maps.  

This project is a fork of the Epidemiology on FHIR module, written for my graduate studies in Biomedical Informatics at the University of Chicago.  

- [Epidemiology on FHIR Slidedeck](https://docs.google.com/presentation/d/1pHMpB_VmkfPz0a7hRyxeDX8HG9NzZyQCK7oLxAGMPFk/edit?usp=sharing)  
- [Cholera Mist - Errors in Mapmaking and Disease Theory](https://drive.google.com/open?id=0BwZijsCqmA-GUndDQmRRbGZVMzQ)  



#### Installation  
This project is best run on Macintosh with Chrome, and is intended to run on Linux servers in an AWS cloud environment.  Compiling to Docker is supported, but an advanced feature.

```
# install Meteor, if you don't already have it
# this is the build tool / compiler  
curl https://install.meteor.com/ | sh

# clone the Node on FHIR boilerplate
# this boilerplate is similar to WordPress
# and supports a plugin/package architecture
git clone https://github.com/symptomatic/node-on-fhir
cd node-on-fhir

# clone this package into the project
cd packages
git clone https://github.com/symptomatic/covid19-on-fhir
git clone https://github.com/symptomatic/covid19-geomapping

# install dependencies
cd ..
meteor npm install

# run the application  
meteor run --extra-packages symptomatic:covid19-on-fhir,symptomatic:covid19-geomapping --settings packages/covid19-on-fhir/configs/settings.covid19.maps.json  
```

#### FAQ  

_Who is your intended user?_  
The underlying mapping technology has applications for just about every stakeholder, but there seems to be particular need at the population health level (placement of testing centers, tracking overall spread), the field dispatch level (EMTs, police, social workers), and the individual patient levels.

_Do you have addresses of COVID 19 patients or would that be a HIPAA/privacy issue?_  
Yes, we can actually get to the addresses of COVID19 patients via FHIR.  They will be patients who have visited hospitals or drive through clinics and been part of the official health networks, rather than self-reported data.  But we can get to that data for the hackathon.  As for HIPAA, that use case will need to be installed with Provider Launch Context and run from a HIPAA zone (but we've already set our database up in one, and are preparing for that).  We were initially worried that we would need to bounce data through Google geocoding servers to map addresses into latitude/longitude (which we will probably do with the online demo and synthetic data), but we have a lead on a docker image of a geocoding server that we can run from within our own HIPAA zone.  So, full steam ahead with COVID19 patient address data in a HIPAA compliant manner.  

#### References  
- [CDC - Geospatial Data Resources](https://www.cdc.gov/gis/geo-spatial-data.html)  
- [USGS - National Geospatial Program](https://www.usgs.gov/core-science-systems/national-geospatial-program/national-map)  
- [Homeland Infrastructure Foundation-Level Data (HIFLD)](https://hifld-geoplatform.opendata.arcgis.com/search?groupIds=2900322cc0b14948a74dca886b7d7cfc)  
- [How Epidemics Spread and End](https://www.washingtonpost.com/graphics/2020/health/coronavirus-how-epidemics-spread-and-end/)    
- [HL7 SANER - Situation Awareness for Novel Epidemic Response - Data Sets](https://github.com/AudaciousInquiry/saner-ig/wiki/Data-Sets)   


#### Team Acknowledgements  
- Jason Walonoski, _Bioinformatics_ (Synthea)
- James Agnew, _FHIR Hosting_ (Smile CDR)
- Chris Hafey, _DBA Backup, Business Administration_, (Fomerly Nucleus.io)  
- Andrei Rusu, _Quality Control_, (Nightwatch.js)     
- Jae Brodsky, _Statistician_  
- Sarah Sims, _Business Administration_   
- David Donohue, _Medical Advisory Board_  

#### Acknowledgements (Product Development, Review, & Early Testing)    
- Ken Salyards (SAMSHA, Health and Human Services)  
- Andrea Pitkus, PhD, MLS, (UW School of Medicine and Public Health)  
- Viet Nguyen, MD, (Board Member at Health Level Seven International)   
- Brett Johnson (Personalized Medicine Strategic Planning)   
- Mohit Saigal (Customer Focused IT and PM Leader)  
- Brian Jackson (Academic Clinical Pathologist)  
- Russell Hamm (Evangalist)  
- Rex Stock (Evangalist)  
 
#### A Prayer for Health Care Workers  

May the One who blessed our ancestors  
Bless all those who put themselves at risk to care for the sick  
Physicians and nurses and orderlies  
Technicians and home health aides  
EMTs and pharmacists  
(And bless especially _______)  
Who navigate the unfolding dangers of the world each day,  
To tend to those they have sworn to help.  
Bless them in their coming home and bless them in their going out.  
Ease their fear. Sustain them.  
Source of all breath, healer of all beings,  
Protect them and restore their hope.  
Strengthen them, that they may bring strength;  
Keep them in health, that they may bring healing.  
Help them know again a time when they can breathe without fear.  
Bless the sacred work of their hands.  
May this plague pass from among us, speedily and in our days.  

- Rabbi Ayelet Cohen, March 2020  

