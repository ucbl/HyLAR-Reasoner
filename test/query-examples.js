/**
 * Created by pc on 30/11/2015.
 */
 module.exports = {
     fipaInsert:
         'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
         'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
         'INSERT DATA { ' +
         'fipa:Inspiron rdf:type fipa:Device . ' +
         'fipa:Inspiron fipa:hasConnection fipa:Wifi . ' +
         'fipa:Inspiron fipa:hasConnection fipa:Ethernet100mbps . ' +
         'fipa:Inspiron fipa:hasConnection fipa:Bluetooth . ' +
         'fipa:Request1 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:Request2 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:Inspiron fipa:hasName "Dell Inspiron 15R" . ' +
         'fipa:Wifi rdf:type fipa:ConnectionDescription . ' +
         'fipa:Bluetooth rdf:type fipa:ConnectionDescription . ' +
         'fipa:Zigbee rdf:type fipa:ConnectionDescription . ' +
         'fipa:Ethernet100mbps rdf:type fipa:ConnectionDescription . ' +
         '}',
     fipaDelete:
         'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
         'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
         'DELETE DATA { ' +
         'fipa:Inspiron rdf:type fipa:Device . ' +
         'fipa:Inspiron fipa:hasConnection fipa:Wifi . ' +
         'fipa:Inspiron fipa:hasConnection fipa:Ethernet100mbps . ' +
         'fipa:Inspiron fipa:hasConnection fipa:Bluetooth . ' +
         'fipa:Request1 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:Request2 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:Inspiron fipa:hasName "Dell Inspiron 15R" . ' +
         'fipa:Wifi rdf:type fipa:ConnectionDescription . ' +
         'fipa:Bluetooth rdf:type fipa:ConnectionDescription . ' +
         'fipa:Zigbee rdf:type fipa:ConnectionDescription . ' +
         'fipa:Ethernet100mbps rdf:type fipa:ConnectionDescription . ' +
         '}'
 }