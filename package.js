Package.describe({
    name: 'symptomatic:covid19-geomapping',
    version: '0.4.7',
    summary: 'COVID19 Hackathon',
    git: 'https://github.com/symptomatic/covid19-geomapping',
    documentation: 'README.md'
});
  

Package.onUse(function(api) {
    api.versionsFrom('1.4');
    
    api.use('meteor-base@1.4.0');
    api.use('ecmascript@0.13.0');
    api.use('react-meteor-data@0.2.15');
    api.use('session');
    api.use('mongo');
    api.use('http');
    api.use('ejson');
    api.use('random');
    api.use('fourseven:scss');

    api.use('browser-policy@1.1.0')

    api.use('clinical:hl7-fhir-data-infrastructure@6.4.17');

    api.addFiles('stylesheets/maps.css', 'client');
    
    api.addFiles('server/BrowserPolicies.js', 'server');
    api.addFiles('server/Geocoding.js', 'server');
    api.addFiles('server/HospitalIndex.js', 'server');

    // api.addFiles('geodata/illinois-epa-toxic-inventory-sites.geojson', 'client', {isAsset: true});
    // api.addFiles('geodata/covid19-patients-synthea.geojson', 'client', {isAsset: true});

    api.addFiles('geodata/Hospitals.geojson', 'server', {isAsset: true});

    api.mainModule('index.jsx', 'client');
});

Npm.depends({
    "google-map-react":"1.1.7",
    "node-geocoder": "3.26.0"
});