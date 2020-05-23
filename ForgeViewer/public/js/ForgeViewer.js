var viewer;
launchViewer();

function launchViewer() {
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };

  Autodesk.Viewing.Initializer(options, () => {
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('forgeViewer'), { extensions: [ 'Autodesk.DocumentBrowser'] });
    viewer.start();
    let urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDIwLTA1LTIzLTA3LTQ2LTI4LWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL2JveGVyRW5naW5lLnN0cA';
    var documentId = 'urn:'+ urn;
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}

function onDocumentLoadSuccess(doc) {
  var viewables = doc.getRoot().getDefaultGeometry();
  viewer.loadDocumentNode(doc, viewables).then(i => {
    // documented loaded, any action?
  });

  let supportTree = {};

  viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function () {
    const tree = viewer.model.getInstanceTree();
    const rootId = tree.getRootId();
    
    tree.enumNodeChildren(
      rootId,
      function (dbId) {
        let name = tree.getNodeName(dbId);
        if (supportTree[name] === undefined) {
          supportTree[name] = [dbId];
        }
        tree.enumNodeChildren(dbId, function (id) {
          supportTree[name].push(id);
        })
      },
      true
    );
    initTable(supportTree);
  });
}

function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function getForgeToken(callback) {
  fetch('/api/forge/oauth/token').then(res => {
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
    });
  });
}

function initTable(supportTree) {
  let treeInfo = supportTree;
  let index = 1;
  let table = document.querySelector('.items_table1 tbody');
  console.log(treeInfo);
  for (let key in treeInfo) {

    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");

    table.append(tr);
    tr.append(td1);
    tr.append(td2);

    td1.innerText = index;
    td2.innerText = key;
    
    index++;
  }
}

function zoom(elem) {
}