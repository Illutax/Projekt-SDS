Die Kommunikationsschnittstelle (Remote-Interface) bietet Zugriff auf festgelegte Events und Funktionen in unterschiedlichen Modulen. Sie ist mit **[Backbone.Radio](https://github.com/marionettejs/backbone.radio)** umgesetzt. Backbone.Radio wird als Radio in den globalen Namespace importiert.

Die Kommunikationsschnittstelle kann erst verwendet werden, wenn alle notwendigen Module geladen sind. Hierfür wird per window.postMessage() ein MessageEvent bereitgestellt, auf das sich wie folgt registriert werden kann:

```
#!js
window.addEventListener("message", function (messageEvent) {
      if (messageEvent.data === "portalReady") {
         Radio.request("RemoteInterface", "getZoomLevel");
      }
}, false);

```

Eine vollständige Auflistung aller Events erfolgt nachfolgend. Die Syntax unterscheidet sich zwischen *Triggern* zum Verändern von Kartenzuständen und Auslösen von Operationen, *Requests* zum Abfragen von Kartenzuständen und *Events*, auf die sich registriert werden kann. Sie ist nachfolgend beschrieben.


**Syntax Trigger**
```
#!js
Radio.trigger("RemoteInterface", eventName [, parameter])
```

**Syntax Request**
```
#!js
Radio.request("RemoteInterface", eventName);
```

**Syntax Event**
```
Radio.on("RemoteInterface", eventName, function (eventObject) {
   console.log(eventObject);
});

Radio.once("RemoteInterface", eventName, function (eventObject) {
   console.log(eventObject);
});
```

---
**Inhaltsverzeichnis:**

[TOC]

---
# **RemoteHost**

Über die hier genannten Aufrufe kann das Masterportal, sofern es als iFrame eingebunden ist, mit dem parentObject kommunizieren.

## Nachricht senden
*(postMessage)*

Sendet eine Nachricht an das parent-Object über postMessage-API.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|content|Object|der zu sendende Content.|

**Beispiel-Aufruf**
```
Radio.request("RemoteInterface", "postMessage", {...});
```
Das Portal kann auch per PostMessage Funktionsaufrufe und Daten entgegen nehmen und entsprechend reagieren.
Dabei ist es wichtig, dass im mitgesendeten JSON ein Key so heißt wie die Funktion die ausgeführt werden soll.

### Mögliche Funktionen sind:
### showPositionByExtent
Wird diese Funktion angetriggered, so wird ein Marker an die Zentrumskoordinate des übergebenen Extents gesetzt und die Karte auf diese Koordinate zentriert.

**Beispiel-Aufruf von extern**
```js
var iframe = document.getElementById("id").contentWindow;
iframe.postMessage({"showPositionByExtent": [xMin, yMin, xMax, yMax]}, domain);
```
Attribute des JSON-Objektes:

|Name|Typ|Beschreibung|
|----|---|------------|
|showPositionByExtent|Array|Extent an dessen Zentrumskoordiante ein Marker gesetzt wird.|

### showPositionByExtentNoScroll
Wird diese Funktion angetriggered, so wird ein Marker an die Zentrumskoordinate des übergebenen Extents gesetzt. Allerdings wird die Karte **nicht** auf diese Koordinate zentriert.

**Beispiel-Aufruf von extern**
```js
var iframe = document.getElementById("id").contentWindow;
iframe.postMessage({"showPositionByExtentNoScroll": [xMin, yMin, xMax, yMax]}, domain);
```
Attribute des JSON-Objektes:

|Name|Typ|Beschreibung|
|----|---|------------|
|showPositionByExtentNoScroll|Array|Extent an dessen Zentrumskoordiante ein Marker gesetzt wird.|

### transactFeatureById
Wird diese Funktion angetriggered, so wird ein Feature eines gegebenen WFST-Layers modifiziert.

**Beispiel-Aufruf von extern**
```js
var iframe = document.getElementById("id").contentWindow;
iframe.postMessage({"transactFeatureById": "id", "layerId": layerId, "attributes": attrs, "mode": "update"}, domain);
```
Attribute des JSON-Objektes:

|Name|Typ|Beschreibung|
|----|---|------------|
|transactFeaturesById|String|Id des Features.|
|layerId|String|Id des Layers.|
|attributes|String|JSON mit den Attributes des Features.|
|mode|String|auszuführende Operation. Momentan nur "update" implementiert.|

### zoomToExtent
Wird diese Funktion angetriggered, so wird die Karte auf den übergebenen Extent gezoomt.

**Beispiel-Aufruf von extern**
```js
var iframe = document.getElementById("id").contentWindow;
iframe.postMessage({"zoomToExtent": [xmin, ymin, xmax, ymax]}, domain);
```
Attribute des JSON-Objektes:

|Name|Typ|Beschreibung|
|----|---|------------|
|zoomToExtent|Array|Extent.|

### highlightfeature
Wird diese Funktion angetriggered, so wird ein Vektor-Feature in der Karte gehighlightet.

**Beispiel-Aufruf von extern**
```js
var iframe = document.getElementById("id").contentWindow;
iframe.postMessage({"highlightfeature": "layerid,featureId"}, domain);
```
Attribute des JSON-Objektes:

|Name|Typ|Beschreibung|
|----|---|------------|
|highlightfeature|String|LayerId und FeatureId in einem String per Komma separiert|

### hidePosition
Wird diese Funktion angetriggered, so wird der Marker versteckt.

**Beispiel-Aufruf von extern**
```js
var iframe = document.getElementById("id").contentWindow;
iframe.postMessage("hidePosition", domain);
```
|Name|Typ|Beschreibung|
|----|---|------------|
|hidePosition|String|"hidePosition". Dadurch wird der Marker versteckt.|

## Nachricht ans Radio senden
Eine Möglichkeit, via postMessage direkt das Radio des Masterportals anzusprechen ist, den Radio-Channel und die anzutriggernde Funktion zu übergeben.

**Beispiel-Aufruf von extern**
```js
var iframe = document.getElementById("id").contentWindow;
iframe.postMessage({"radio_channel": "Draw", "radio_function": "initWithoutGUI", "radio_para_object": {"drawType": "Polygon"}}, domain);
```
Attribute des JSON-Objektes:

|Name|Typ|Beschreibung|
|----|---|------------|
|radio_channel|String|Der Radio-Channel, der angesprochen werden soll.|
|radio_function|String|Die Funktion des Radio-Channels, die angesprochen werden soll.|
|radio_para_object|Object|(optional) Ein Parameter-Objekt, das an die Radio-Funktion übergeben wird.|

# **Karte**

Über die hier genannten Aufrufe können bestimmte Kartenzustände gesetzt oder abgefragt werden und die Sichtbarkeit von Layern verändert werden.

## URL der aktuellen View zurückgeben
*(getMapState)*

Gibt die parametrisierte URL zurück, mit der die aktuelle Ausprägung der Karte mit dargestellten Layern und deren Sichtbarkeit und Transparenz zentriert und im selben Maßstab geöffnet werden kann.


**Returns** *URL* String


**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "getMapState");
```

## BoundingBox WGS84 abfragen
*(getWGS84MapSizeBBOX)*

Gibt den aktuellen Extent (BoundingBox) der Karte im WGS84 zurück.


**Returns** *[Rechtswert Min, Hochwert Max, Rechtswert Max, Hochwert Min]* (Array mit Rechts- und Hochwerten)


**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "getWGS84MapSizeBBOX");
```

## Setzt die View der Map zurück
*(resetView)*

Zoomt die View der Map auf den Ausgangsmaßstab und -ausschnitt und entfernt den MapMarker.

**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "resetView");
```

## Übernimmt Attribute an einen Layer
*(setModelAttributesById)*

Übernimmt das attributes-Object an speziellen Layer.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|id|String|LayerID des Layers, dem Attribute zegeordnet werden.|
|attributes|Object|Attribute|


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "setModelAttributesById", {...});
```

---
# **Vektorfeatures**

Über die hier genannten Aufrufe können spezielle Methoden und Funktionen für Vektorfeatures aufgerufen werden.

## Zeige alle Features in speziellem Layer
*(showAllFeatures)*

Zeigt alle Vektorfeatures des genannten Layers an.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|value|String|Layername mit den Vektorfeatures|


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "showAllFeatures", "Anliegen");
```

## Zeige spezielle Features in speziellem Layer
*(showFeaturesById)*

Zeigt alle Vektorfeatures des genannten Layers an.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|value|String|Layername mit den Vektorfeatures|
|featureIds|[id]|Array mit FeautureIDs|


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "showFeaturesById", "Anliegen", ["1", "2"]);
```

## Zeige Marker im gegebenen Extent
*(showPositionByExtent)*

Positioniert einen Marker auf der Karte im Zentrum des übergebenen Extents.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|extent|Array|Extent|


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "showPositionByExtent", [minX, minY, maxX, maxY]);
```
