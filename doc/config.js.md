>Zurück zur **[Dokumentation Masterportal](doc.md)**.

[TOC]

# config.js #
Die *config.js* enthält die Konfigurationsoptionen für das Masterportal, die sich nicht auf die Portal-Oberfläche oder die dargestellten Layer beziehen, z.B. Pfade zu weiteren Konfigurationsdateien. Die *config.js* liegt im Regelfall neben der index.html und neben der *config.json*.
Im Folgenden werden die einzelnen Konfigurationsoptionen beschrieben. Darüber hinaus gibt es für die Konfigurationen vom Typ *object* weitere Optionen, diese Konfigurationen sind verlinkt und werden im Anschluss an die folgende Tabelle jeweils genauer erläutert. Hier geht es zu einem **[Beispiel](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/stable/portal/master/config.js)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|**[clickCounter](#markdown-header-clickcounter)**|nein|Object||Konfigurationsobjekt des ClickCounterModuls. Dieses lädt für jeden registrierten Klick ein iFrame.||
|cswId|nein|String|"3"|Referenz auf eine CS-W Schnittstelle, die für die Layerinformation genutzt wird. ID wird über **[rest-services.json](rest-services.json.md)** aufgelöst.|`"meine CSW-ID"`|
|metaDataCatalogueId|nein|String|"2"|URL des in den Layerinformationen verlinkten Metadatenkatalogs. Die ID wird über **[rest-services.json](rest-services.json.md)** aufgelöst.|`"MetadatenkatalogURL"`|
|**[footer](#markdown-header-footer)**|nein|Object||Zeigt einen Footer-Bereich an und konfiguriert diesen.||
|gfiWindow|nein|String|"detached"|Darstellungsart der Attributinformationen für alle Layertypen. **attached**: das Fenster mit Attributinformationen wird am Klickpunkt geöffnet. **detached**: das Fenster mit Attributinformationen wird oben rechts auf der Karte geöffnet. Der Klickpunkt wird zusätzlich mit einem Marker gekennzeichnet.|`"attached"`|
|ignoredKeys|nein|Array[String]|["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"]|Liste der ignorierten Attributnamen bei der Anzeige von Attributinformationen aller Layertypen.|["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"]|
|inputMap|nein|Object|`{}`|Ist dieses Objekt vorhanden, dann wird das Masterportal als Eingabeelement für Daten konfiguriert. Das bedeutet, dass jeder Klick auf die Karte einen Map Marker setzt und die Koordinaten des Markers via RemoteInterface im gewünschten Koordninatensystem sendet.|`{targetProjection: "EPSG:4326", setCenter: false}`|
|inputMap.targetProjection|nein|String|`EPSG:25832`|Das Zielkoordninatensystem, in dem die Koordinaten des Markers gesendet werden sollen.|`targetprojection: "EPSG:4326`|
|inputMap.setCenter|nein|Boolean|false|Soll die Karte nach dem setzen eines Markers um den Marker zentriert werden?|`setCenter: true`|
|layerConf|ja|String||Pfad zur **[services.json](services.json.md)**, die alle verfügbaren WMS-Layer bzw. WFS-FeatureTypes enthält. Der Pfad ist relativ zu *js/main.js*.|`"../components/lgv-config/services-internet.json"`|
|**[mouseHover](#markdown-header-mouseHover)**|nein|Object||Steuert, ob MouseHover für Vektorlayer (WFS und GeoJSON) aktiviert ist. Weitere Konfigurationsmöglichkeiten pro Layer in **[config.json](config.json.md)** (*Themenconfig.Fachdaten.Layer*).|`true`|
|namedProjections|ja|Array[String]||Festlegung der nutzbaren Koordinatensysteme (**[siehe Syntax](http://proj4js.org/#named-projections)**).|`[["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]]`|
|proxyUrl|ja|String||Absoluter Server-Pfad zu einem Proxy-Skript, dass mit *"?url="* aufgerufen wird. Notwendig, wenn der Druck-Dienst konfiguriert ist (siehe **[print](#markdown-header-print)**).|`"/cgi-bin/proxy.cgi"`|
|proxyHost|nein|String||Hostname eines remote Proxy (dort muss CORS aktiviert sein)|`"https://proxy.example.com"`|
|proxy|nein|Boolean|true|Gibt an ob bei URLs Punkte durch Unterstriche ersetzt werden sollen. Dadurch werden CORS-Fehler verhindert. Achtung: Es muss serverseitig ein Reverse-Proxy eingerichtet werden.||
|[quickHelp]|nein|Object|`{}`|Aktiviert das QuickHelp-Modul. Dieses zeigt ein Hilfefenster für die verfügbaren Funktionen des jeweiligen Modul an. Bisher verfügbar für den Themenbaum (CustomTree), die Suchleiste (Searchbar) und für das Werkzeug: Messen (MeasureTool)).||
|portalConf|nein|String|"config.json"|Pfad zur config.json des Portals. Es kann auch ein Knotenpunkt angegeben werden. Der Weiterführende Pfad wird dann über den URL-Parameter "config" gesteuert.|Direkter Pfad: "../masterTree/config.json"; Knotenpunkt: "../../portal/master/". Zusätzlich muss dann in der URL der Parameter "config=config.json" stehen.|
|restConf|ja|String||Pfad zur **[rest-services.json](rest-services.json.md)**, die weitere, verfügbare Dienste enthält (z.B. Druckdienst, WPS, CSW). Der Pfad ist relativ zu js/main.js.|`"../components/lgv-config/rest-services-internet.json"`|
|scaleLine|nein|Boolean|false|Steuert, ob eine Maßstabsleiste unten rechts auf der Karte angezeigt wird.|`true`|
|simpleMap|nein|Boolean|false|Fügt dem *„Auswahl speichern“-Dialog* eine SimpleMap-URL hinzu (ohne Menüleiste, Layerbau, Map Controls). Nicht für Portale mit Baumtyp: *„light“*.|`false`|
|uiStyle|nein|String|default|Steuert das Layout der Bedienelemente. |`table`|
|styleConf|ja|String||Pfad zur **[style.json](style.json.md)**, die Styles für Vektorlayer (WFS) enthält. Der Pfad ist relativ zu *js/main.js*.|`"../components/lgv-config/style.json"`|
|**[tree](#tree)**|nein|Object||||
|infoJson|nein|String|"info.json"|Pfad zur info.json, die Zusatzinformationen für Snippets enthält. Der Pfad ist relativ zur index.html.|`"info.json"`|
|wfsImgPath|nein|String||Pfad zum Ordner mit Bildern, die für WFS-Styles benutzt werden. Der Pfad ist relativ zu *js/main.js*.|`"../components/lgv-config/img/"`|
|wpsID|nein|String|""|Referenz auf eine WPS-Schnittstelle, die in verschiedenen Modulen genutzt wird. ID wird über **[rest-services.json](rest-services.json.md)** aufgelöst.|`""`|
|**[zoomToFeature](#markdown-header-zoomtofeature)**|nein|Object||Optionale Konfigurations-Einstellungen für den URL-Parameter *featureid*. Siehe **[URL-Parameter](URL-Parameter.md)**.||
|postMessageUrl|nein|String|"http://localhost:8080"|Url auf die das Portal per post-Message agieren und reagieren kann.| "http://localhost:8080"|
|startingMap3D|nein|Boolean|false|Legt fest ob der 3D Modus beim Start der Anwendung geladen werden soll.||
|obliqueMap|nein|Boolean|false|Legt fest eine Schrägluftbild Karte erstellt werden soll. Benötigt zusätzlich noch eine Schrägluftbildebene.||
|**[cameraParameter](#markdown-header-cameraParameter)**|nein|Object||Start Camera Parameter||
|**[cesiumParameter](#markdown-header-cesiumParameter)**|nein|Object||Cesium Flags||
|**[remoteInterface](#markdown-header-remoteInterface)**|nein|object||Optionale Konfiguration für das remoteInterface.||
|defaultToolId|nein|String|"gfi"|Id des Tools, das immer an sein soll, wenn kein anderes Tool aktiv ist.|"filter"|
|**[alerting](#markdown-header-alerting)**|nein|Object|{"category": "alert-info", "isDismissable": true, "isConfirmable": false, "position": "top-center", "fadeOut": null}|Konfigurationsobjekt zum Überschreiben der default Werte des Alerting Moduls.|{fadeOut: 6000}|

*********
## quickHelp ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|imgPath|nein|String|`"/"`|Gibt den Pfad (relativ oder absolut) zu einem Dateiordner an, in dem sich die Bilder für die Quickhelp befinden.|
|searchbarAllgemeines1|nein|String|`"allgemein.png"`|Erstes Bild zur Darstellung in der Quickhelp der Searchbar unter dem Menüpunkt Allgemeines. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|searchbarAllgemeines2|nein|String|`"allgemein_2.png"`|Zweites Bild zur Darstellung in der Quickhelp der Searchbar unter dem Menüpunkt Allgemeines. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|searchbarAllgemeines3|nein|String|`"allgemein_3.png"`|Drittes Bild zur Darstellung in der Quickhelp der Searchbar unter dem Menüpunkt Allgemeines. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|searchbarFlurstueckssuche|nein|String|`"allgemein_4.png"`|Bild zur Darstellung in der Quickhelp der Searchbar unter dem Menüpunkt Flurstückssuche. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|aufbau1|nein|String|`"themen.png"`|Erstes Bild zur Darstellung in der Quickhelp des Themenbaums (CustomTree) unter dem Menüpunkt Aufbau. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|aufbau2|nein|String|`"themen_2.png"`|Zweites Bild zur Darstellung in der Quickhelp des Themenbaums (CustomTree) unter dem Menüpunkt Aufbau. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|statistikFlaecheNiemeier|nein|String|`"Statistik_Flaeche_Niemeier.png"`|Erstes Bild zur Darstellung in der Quickhelp des Werkzeugs Messen (MeasureTool) unter dem Menüpunkt Statistische Annäherung. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|statistikStreckeUniErlangen|nein|String|`"Statistik_Strecke_UniErlangen.png"`|Zweites Bild zur Darstellung in der Quickhelp des Werkzeugs Messen (MeasureTool) unter dem Menüpunkt Statsitische Annäherung. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|utmStreifen|nein|String|`"UTM_Streifen.png"`|Erstes Bild zur Darstellung in der Quickhelp des Werkzeugs Messen (MeasureTool) unter dem Menüpunkt Entzerrung in UTM. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|utmVerzerrung|nein|String|`"UTM_Verzerrung.png"`|Zweites Bild zur Darstellung in der Quickhelp des Werkzeugs Messen (MeasureTool) unter dem Menüpunkt Entzerrung in UTM. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|utmFormeln|nein|String|`"UTM_Formeln.png"`|Drittes Bild zur Darstellung in der Quickhelp des Werkzeugs Messen (MeasureTool) unter dem Menüpunkt Entzerrung in UTM. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|

*********
## mouseHover ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minShift|nein|Integer|5|Gibt an, wieviele Pixel sich die Position gegenüber vorher verändert haben muss, um ein neues Tooltip zu rendern.|
|numFeaturesToShow|nein|Integer|2|Maximale Anzahl an Elementinformationen im Tooltip, bevor ein InfoText die Anzahl limitiert.|
|infoText|nein|String|"(weitere Objekte. Bitte zoomen.)"|Meldung die bei Überschreiten der numFeaturesToShow mit im MouseHover angezeigt wird.|

*********
## remoteInterface ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|postMessageUrl|nein|String|"http://localhost:8080"|Url auf die das Portal per post-Message agieren und reagieren kann.

**Beispiel:**
```
#!json
remoteInterface:{
    postMessageUrl: "http://localhost:8080"
}

```
*********

## clickCounter ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|desktop|nein|String||URL des iFrames bei Desktopausspielung.|
|mobile|nein|String||URL des iFrames bei mobiler Ausspielung.|

**Beispiel:**


```
#!json

clickCounter:
{
desktop: "http://static.hamburg.de/countframes/verkehrskarte_count.html",
mobil: "http://static.hamburg.de/countframes/verkehrskarte-mobil_count.html"
}

```

*********

## footer ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|**[urls](#markdown-header-footerurls)**|nein|Array[Object]||Array von URL-Konfigurationsobjekten. Auch hier existieren wiederum mehrere Konfigurationsmöglichkeiten, welche in der folgenden Tabelle aufgezeigt werden.|
|showVersion|nein|Boolean|false|Flag, ob die Versionsnummer des Masterportals im Footer angezeigt werden soll.|

******
### footer.urls ###
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|alias|nein|String|"Landesbetrieb Geoniformation und Vermessung"|Bezeichnung des Links bei Desktop-Ausspielung.|
|alias_mobil|nein|String|"LGV"|Bezeichnung bei mobiler Ausspielung.|
|bezeichnung|nein|String|"Kartographie und Gestaltung: "|Bezeichnung vor dem Link.|
|url|nein|String|„http://www.geoinfo.hamburg.de/“|Die aufzurufende URL.|
|toolModelId|nein|String|"sdpdownload"|Die id des Models dessen Tool geöffnet werden soll, eine url ist dann nicht nötig.|


**Beispiel:**

```
#!json
footer: {
    urls: [
        {
            "bezeichnung": "Kartographie und Gestaltung: ",
            "url": "http://www.geoinfo.hamburg.de/",
            "alias": "Landesbetrieb Geoniformation und Vermessung",
            "alias_mobil": "LGV"
        },
        {
            "bezeichnung": "",
            "url": "http://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/index.php",
            "alias": "SDP Download",
            "alias_mobil": "SDP"
        },
        {
            "bezeichnung": "",
            "url": "http://www.hamburg.de/bsu/timonline",
            "alias": "Kartenunstimmigkeit"
        },
        {
            "bezeichnung": "",
            "url": "",
            "alias": "SDP Download",
            "toolModelId": "sdpdownload"
        }
    ],
    "showVersion": true
}
```
*********

## tree ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|orderBy|nein|String|OpenData|Gibt die Kategorie an nach der initial der Themenbaum sortiert wird.|
|layerIDsToIgnore|nein|Array|| Array mit LayerIDs aus der services.json die nicht im Themenbaum dargestellt werden.|
|**[layerIDsToStyle](#markdown-header-layerIDsToStyle)**|nein|Array[Object]||Speziell für HVV Dienst. Enthält Objekte um verschiedene Styles zu einer layerId abzufragen.|
|metaIDsToMerge|nein|Array||Fasst alle unter dieser metaID gefundenen Layer aus der services.json zu einem LAyer im Themenbaum zusammen.|
|metaIDsToIgnore|nein|Array||Alle Layer der Service.json mit entsprechender metaID werden ignoriert im Themenbaum.|
|isFolderSelectable|nein|Boolean|true|Legt auf globaler Ebene fest, ob eine Auswahlbox zur Selektierung aller Layer eines Ordners angezeigt werden soll. Diese Festlegung kann von Element-Eigenschaften überschrieben werden (vgl. **[config.json](config.json.md#Ordnerkonfiguration-Fachdaten)**).|

******
### tree.layerIDsToStyle ###
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|id|nein|Sring||Entsprechend der LayerId aus der service.json.|
|styles|nein|String oder Array||Enthält einen zu verwendenden Style als String oder bei verschiedenen Styles ein Array aus Strings.|
|name|nein|String oder Array||Enthält einen zu verwendenden Namen als String oder bei verschiedenen Namen ein Array aus Strings.|
|legendUrl|nein|String oder Array||Enthält eine zu verwendenden Legende als String oder bei verschiedenen Legenden ein Array aus Strings.|


**Beispiel:**

```
#!json

tree: {
            orderBy: "opendata",
            layerIDsToIgnore: ["1912", "1913"],
            layerIDsToStyle: [
                {
                    "id": "1935",
                    "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
                    "name": ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
                    "legendURL": ["http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-faehre.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bahn.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png"]
                }
            ],
            metaIDsToMerge: [
                "FE4DAF57-2AF6-434D-85E3-220A20B8C0F1"
            ],
            metaIDsToIgnore: [
                "09DE39AB-A965-45F4-B8F9-0C339A45B154"
            ],
            isFolderSelectable: false
        }
```

## zoomToFeature ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[imgLink(Deprecated in 3.0.0)]()|ja|String||Link für den Marker.|
|wfsId|ja|String||ID des WFS-Layers von dem die Position abgefragt wird.|
|attribute|ja|String||Attributname. Entspricht Attribut nach dem der WFS gefiltert wird.|
|styleId|nein|String||Hier kann eine StyleId aus der style.json angegeben werden um den Standard-Style vom MapMarker zu überschreiben..|

**Beispiel:**
```
#!json
zoomtofeature: {
    attribute: "flaechenid",
    wfsId: "4560",
    styleId: "location_eventlotse"
}
```
********

## cameraParameter ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|heading|nein|Number||Heading der Kamera in Radians.|
|tilt|nein|Number||Tilt der Kamera in Radians.|
|altitude|nein|Number||Höhe der Kamera in m.|

********

## cesiumParameter ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|fog|nein|Object||Nebel Einstellungen. Optionen siehe **[fog]**|
|enableLighting|nein|Boolean|false|aktiviert Lichteffekte auf dem Terrain von der Sonne aus.|
|maximumScreenSpaceError|nein|Number|2.0|Gibt an wie detailliert die Terrain/Raster Kacheln geladen werden. 4/3 ist die beste Qualität.|
|fxaa|nein|Number|true|aktiviert Fast Approximate Anti-alisasing.|
|tileCacheSize|nein|Number|100|Größe des Tilecaches für Terrain/Raster Kacheln.|


[fog]: https://cesiumjs.org/Cesium/Build/Documentation/Fog.html
********

## alerting ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|category|nein|String|"alert-info"|Bestimmt das Layout des Bootstrap-Alerts. Siehe **[Bootstrap](https://getbootstrap.com/docs/3.3/components/#alerts)**|
|isDismissable|nein|Boolean|true|Legt fest, ob der Alarm weggeklickt werden kann, indem eine weitere Bootstrap-Class am alert gesetzt wird .|
|isConfirmable|nein|Boolean|false|Flag ob alert bestätigt werden muss.|
|position|nein|String|"top-center"|Position des Alerts (Bootstrap-Class)|
|fadeOut|nein|Integer|null|Milliseconds bis zum automatischen fade-out des alerts|

>Zurück zur **[Dokumentation Masterportal](doc.md)**.
