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
         'fipa:111113 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111114 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111115 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111116 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111117 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111118 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111119 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111112 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111113 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111114 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111115 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111116 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111117 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111118 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111119 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111112 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111113 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111114 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111115 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111116 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111117 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111118 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111119 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111112 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111113 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111114 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111115 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111116 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111117 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111118 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111119 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111112 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111113 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111114 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111115 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111116 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111118 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111119 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111111112 rdf:type fipa:RequestDeviceInfo . ' +
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
         'fipa:111113 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111114 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111115 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111116 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111117 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111118 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111119 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111112 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111113 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111114 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111115 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111116 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111117 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111118 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111119 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111112 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111113 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111114 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111115 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111116 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111117 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111118 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111119 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111112 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111113 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111114 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111115 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111116 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111117 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111118 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:111111119 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111112 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111113 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111114 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111115 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111116 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111118 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:1111111119 rdf:type fipa:RequestDeviceInfo . ' +
         'fipa:11111111112 rdf:type fipa:RequestDeviceInfo . ' +
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