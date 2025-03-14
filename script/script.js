
// Email für CONTACT Button
function openEmail() {
  var emailAddress = 'contact@usedcommunity.de';
  var subject = 'used zielsystem';
  var body = '';

  var mailtoLink = 'mailto:' + encodeURIComponent(emailAddress) +
                   '?subject=' + encodeURIComponent(subject) +
                   '&body=' + encodeURIComponent(body);
  window.location.href = mailtoLink;
}

var network;
var allNodes;
var originalColors = {}; // Speichern der ursprünglichen Farben
var selectedNodes = []; // Liste für doppelt geklickte Knoten
var nodesDataset = new vis.DataSet(nodes);
var edgesDataset = new vis.DataSet(edges);
var highlightActive = false;
var contextMenu = document.getElementById("context-menu");

// Funktion für die Navigation
function navigateTo(url) {
    window.open(url, "_blank");
}

//initialisierung des Netzwerkes
function redrawAll() {
    var container = document.getElementById("mynetwork");
    var options = {
        nodes: {
            shape: "dot",
            scaling: {
                min: 10,
                max: 30,
                label: {
                    min: 8,
                    max: 30,
                    drawThreshold: 12,
                    maxVisible: 20,
                    font: {
                        multi: true,
                        html: true,
                    },
                },
            },
            font: {
                size: 12,
                color: '#ffffff', // Weiß
                face: "Tahoma",
                align: "center", // Text mittig
                vadjust: -20     // Label höher anzeigen
            },
            labelAlignment: "center",
        },
        edges: {
            width: 0.15,
            color: { inherit: "from" },
            smooth: {
                type: "continuous",
            },
        },
        physics: false,
        interaction: {
            tooltipDelay: 200,
            hideEdgesOnDrag: true,
            hideEdgesOnZoom: true,
            hover: true,
        },
    };

    allNodes = nodesDataset.get({ returnType: "Object" });
    for (var nodeId in allNodes) {
        var node = allNodes[nodeId];
        node.hiddenLabel = node.label;  // Speichere das ursprüngliche Label
        node.title = `Label: ${node.label}
          Object: ${node.object}
          Unit: ${node.unit}
          Sustainability Dimension: ${node.sustainabilitydimension}
          Source: ${node.from}`;
    }

    var data = { nodes: nodesDataset, edges: edgesDataset };
    network = new vis.Network(container, data, options);

    // Speichere die ursprünglichen Farben der Knoten
    for (var nodeId in allNodes) {
        originalColors[nodeId] = allNodes[nodeId].color;
    }

    // Event-Listener für Knoten-Klicks
    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            neighbourhoodHighlight(params); // Wenn ein Knoten ausgewählt wurde
        } else {
            resetGraph(); // Wenn in den leeren Raum geklickt wurde
        }
    });

    // Event für Doppelklick auf Knoten
    network.on("doubleClick", function (params) {
        if (params.nodes.length > 0) {
            var selectedNodeId = params.nodes[0];
            addNodeToList(selectedNodeId);
        }
    });

    // Event-Listener für Rechtsklick auf einen Knoten
    network.on("oncontext", function (params) {
        params.event.preventDefault();
        const nodeId = network.getNodeAt(params.pointer.DOM);

        if (nodeId) {
            // Kontextmenü anzeigen
            const node = nodesDataset.get(nodeId);
            contextMenu.style.top = params.event.pageY + "px";
            contextMenu.style.left = params.event.pageX + "px";
            contextMenu.style.display = "block";

            // Menüeintrag "Weitere Informationen" erstellen
            contextMenu.innerHTML = `
            <div class="context-menu-item" onclick="navigateTo('${node.link}')">
                Weitere Informationen
            </div>
            `;
        } else {
            // Kontextmenü verstecken, wenn kein Knoten geklickt wird
            contextMenu.style.display = "none";
        }
    });


}



// Suchfunktion
function searchNode() {
    var searchValue = document.getElementById("search-input").value.toLowerCase();
    var nodeFound = false;

    // Setze alle Knoten auf ausgegraut und verstecke ihre Labels
    resetAllNodes();

    // Suche nach dem Knoten mit dem Label
    for (var nodeId in allNodes) {
        if (allNodes[nodeId].hiddenLabel && allNodes[nodeId].hiddenLabel.toLowerCase().includes(searchValue)) {
            allNodes[nodeId].color = "purple"; // Gesuchter Knoten immer pink hervorheben
            allNodes[nodeId].label = allNodes[nodeId].hiddenLabel; // Label wieder anzeigen
            nodeFound = true;
        }
    }

    if (!nodeFound) {
        alert("Kein Knoten mit diesem Label gefunden.");
    }

    updateNodes();
}

// Kontextmenü bei Klick außerhalb verstecken
document.addEventListener("click", function () {
    contextMenu.style.display = "none";
});

// Funktion zur Rücksetzung aller Knotenfarben und Labels
function resetAllNodes() {
    for (var nodeId in allNodes) {
        allNodes[nodeId].color = "rgba(200,200,200,0.5)";
        if (allNodes[nodeId].hiddenLabel !== undefined) {
            allNodes[nodeId].label = undefined; // Labels verbergen
        }
    }
}

// Funktion zur Rücksetzung des gesamten Graphen
function resetGraph() {
    for (var nodeId in allNodes) {
        allNodes[nodeId].color = originalColors[nodeId]; // ursprüngliche Farbe wiederherstellen
        allNodes[nodeId].label = allNodes[nodeId].hiddenLabel; // Label wieder anzeigen
    }
    updateNodes();
}

// Highlight-Funktion für den ausgewählten Knoten und seine Nachbarn
function neighbourhoodHighlight(params) {
    resetAllNodes(); // Setze alle Knoten zurück

    // Wenn ein Knoten ausgewählt wurde
    if (params.nodes.length > 0) {
        highlightActive = true;
        var selectedNode = params.nodes[0];

        // Wähle den geklickten Knoten und seine Nachbarn
        var connectedNodes = network.getConnectedNodes(selectedNode);
        var allConnectedNodes = connectedNodes.concat([selectedNode]);

        // Setze alle Knoten auf ausgegraut und hebe die Nachbarn hervor
        for (var nodeId in allNodes) {
            if (allConnectedNodes.includes(nodeId)) {
                allNodes[nodeId].color = originalColors[nodeId]; // Setze die ursprüngliche Farbe
                allNodes[nodeId].label = allNodes[nodeId].hiddenLabel; // Label wieder anzeigen
            } else {
                allNodes[nodeId].color = "rgba(200,200,200,0.5)"; // Alle anderen ausgrauen
                allNodes[nodeId].label = undefined; // Labels verbergen
            }
        }

        updateNodes();
    }
}

function updateNodes() {
    var updateArray = [];
    for (var nodeId in allNodes) {
        if (allNodes.hasOwnProperty(nodeId)) {
            updateArray.push(allNodes[nodeId]);
        }
    }
    nodesDataset.update(updateArray);
}

// Funktionen für die Liste
function addNodeToList(nodeId) {
    var node = allNodes[nodeId];

// Prüfen, ob der Knoten bereits in der Liste ist
    if (selectedNodes.includes(nodeId)) return;

    selectedNodes.push(nodeId);

    var listItem = document.createElement("div");
    listItem.className = "node-item";

// Hintergrundfarbe überprüfen und setzen
    var nodeColor = node.color.background ? node.color.background : node.color;  // Falls `color.background` nicht existiert, fallback auf `color`

    listItem.style.backgroundColor = nodeColor; // Setze die Hintergrundfarbe des Listenelements

    listItem.innerHTML = `<span>${node.hiddenLabel}</span><span class="delete-btn">X</span>`;

    listItem.querySelector(".delete-btn").addEventListener("click", function () {
        removeNodeFromList(nodeId, listItem);
    });

    document.getElementById("selected-nodes").appendChild(listItem);
}


function removeNodeFromList(nodeId, listItem) {
    selectedNodes = selectedNodes.filter(id => id !== nodeId);
    listItem.remove();
}

function resetSelectedNodes() {
    selectedNodes = [];
    document.getElementById("selected-nodes").innerHTML = "<h3>Selektierte Ziele</h3>";
}

function downloadSelectedNodes() {
    var nodeData = selectedNodes.map(nodeId => {
        var node = allNodes[nodeId];
        return {
            ID: node.id,
            Label: node.hiddenLabel,
            Color: node.color.background,
        };
    });

    var ws = XLSX.utils.json_to_sheet(nodeData);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selected Nodes");
    XLSX.writeFile(wb, "selected_nodes.xlsx");
}

// Initialisiere das Netzwerk
redrawAll();