/**
 * Created by pc on 30/11/2015.
 */
 module.exports = {
     fipaInsert:
         'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
         'PREFIX fipa: <http://sites.google.com/site/smartappliancesproject/ontologies/fipa#> ' +
         'INSERT DATA { ' +
         'fipa:Inspiron rdf:type fipa:Device . ' +
             'fipa:nspiron rdf:type fipa:Device . ' +
             'fipa:spiron rdf:type fipa:Device . ' +
             'fipa:piron rdf:type fipa:Device . ' +
             'fipa:iron rdf:type fipa:Device . ' +
             'fipa:ron rdf:type fipa:Device . ' +
             'fipa:on rdf:type fipa:Device . ' +
             'fipa:n rdf:type fipa:Device . ' +
         'fipa:Inspiron fipa:hasConnection fipa:Wifi . ' +
             'fipa:nspiron fipa:hasConnection fipa:Ethernet100mbps . ' +
             'fipa:ron fipa:hasConnection fipa:Bluetooth . ' +
         'fipa:Request1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:equest1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:quest1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:uest1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:est1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:st1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:t1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:1 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:Inspiron fipa:hasName "Dell Inspiron 15R" . ' +
             'fipa:nspiron fipa:hasName "Dell Inspiron 15" . ' +
             'fipa:spiron fipa:hasName "Dell Inspiron 1" . ' +
             'fipa:piron fipa:hasName "Dell Inspiron " . ' +
             'fipa:iron fipa:hasName "Dell Inspiron" . ' +
             'fipa:ron fipa:hasName "Dell Inspiro" . ' +
             'fipa:on fipa:hasName "Dell Inspir" . ' +
             'fipa:n fipa:hasName "Dell Inspi" . ' +
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
             'fipa:nspiron rdf:type fipa:Device . ' +
             'fipa:spiron rdf:type fipa:Device . ' +
             'fipa:piron rdf:type fipa:Device . ' +
             'fipa:iron rdf:type fipa:Device . ' +
             'fipa:ron rdf:type fipa:Device . ' +
             'fipa:on rdf:type fipa:Device . ' +
             'fipa:n rdf:type fipa:Device . ' +
         'fipa:Inspiron fipa:hasConnection fipa:Wifi . ' +
             'fipa:nspiron fipa:hasConnection fipa:Ethernet100mbps . ' +
             'fipa:ron fipa:hasConnection fipa:Bluetooth . ' +
         'fipa:Request1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:equest1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:quest1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:uest1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:est1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:st1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:t1 rdf:type fipa:RequestDeviceInfo . ' +
             'fipa:1 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:Inspiron fipa:hasName "Dell Inspiron 15R" . ' +
             'fipa:nspiron fipa:hasName "Dell Inspiron 15" . ' +
             'fipa:spiron fipa:hasName "Dell Inspiron 1" . ' +
             'fipa:piron fipa:hasName "Dell Inspiron " . ' +
             'fipa:iron fipa:hasName "Dell Inspiron" . ' +
             'fipa:ron fipa:hasName "Dell Inspiro" . ' +
             'fipa:on fipa:hasName "Dell Inspir" . ' +
             'fipa:n fipa:hasName "Dell Inspi" . ' +
         'fipa:Wifi rdf:type fipa:ConnectionDescription . ' +
         'fipa:Bluetooth rdf:type fipa:ConnectionDescription . ' +
         'fipa:Zigbee rdf:type fipa:ConnectionDescription . ' +
         'fipa:Ethernet100mbps rdf:type fipa:ConnectionDescription . ' +
         '}'
 }