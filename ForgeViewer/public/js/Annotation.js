document.querySelector("#forgeViewer").addEventListener("click", onMouseClick);

let annotations = [];
let annotationMode = false;
let annotationRemoveMode = false;
let isStarted = false;
var input = document.getElementById("annotationRemoveNumber");

function onMouseClick(e) {
    const x = e.clientX - document.querySelector("#left").clientWidth - 15, 
    y = e.clientY - document.querySelector("#top").clientHeight - 18;
    
    console.log(x, y);

    const res = viewer.impl.castRay(x, y, true);

    if(res) {
        pos = viewer.impl.clientToWorld(x, y);
        console.log(pos.point);
        onItemClick(pos.point);
    }

}

function onItemClick(item) {
    if (annotationMode) {
        let text = document.querySelector('#annotationText').value;
        let name = annotations.length;
        addAnnotation(item.x, item.y, item.z, text, +name, true);
    }
}

function addAnnotation(x, y, z, annotationText, id, flag) {
    annotations[id] = {
        x: x,
        y: y,
        z: z,
        text: annotationText,
        flagHidden: true
    };
    displayAnnotation(id);
    setAnnotationPosition(id);
}
document.addEventListener('mousemove', onMouseMove, false);

function hideAnnotation (id) {
    const annotation = document.querySelector('#annotation-' + id);
    const hidden = annotation.classList.contains('hidden');
    document.querySelector('#annotation-text-' + id).innerHTML = hidden ? annotations[id].text : '';
    if (hidden) {
        annotation.classList.remove('hidden');
        annotations[id].flagHidden = false;
    }
    else {
        annotation.classList.add('hidden');
        annotations[id].flagHidden = true;
    }
}

function setAnnotationMode() {
    annotationMode = !annotationMode;
    let tableH;
    if (annotationMode) {
        document.querySelector("#annotationAddText").classList.remove('hidden');
        document.querySelector("#annotationText").classList.remove('hidden');
        document.querySelector("#stopAnnotationMode").classList.remove('hidden');
        tableH = document.querySelector("#left").clientHeight - document.querySelector(".panel-heading").clientHeight  - 140;
        document.querySelector(".objectTrees tbody").style.height = tableH + 'px';
        if (annotationRemoveMode)
            setAnnotationRemoveMode();
    } else {
        document.querySelector("#annotationText").classList.add('hidden');
        document.querySelector("#annotationAddText").classList.add('hidden');
        document.querySelector("#stopAnnotationMode").classList.add('hidden');
        tableH = document.querySelector("#left").clientHeight - document.querySelector(".panel-heading").clientHeight - 140;
        document.querySelector(".objectTrees tbody").style.height = tableH + 'px';
    }
    console.log(document.querySelector(".objectTrees tbody").style.height);
    //console.log('left ' + document.querySelector("#left").clientHeight);
    //console.log('annotation ' + document.querySelector(".objectTrees tbody").clientHeight);
}

function displayAnnotation(id) {
    const annotation = document.createElement('div');
    annotation.id = 'annotation-' + id;
    annotation.classList.add('annotation', 'hidden');
    document.querySelector('#forgeViewer').appendChild(annotation);
    const annotationText = document.createElement('p');
    annotationText.id = 'annotation-text-' + id;
    annotationText.innerText = annotations[id].text;
    annotationText.style.fontSize = "15px";
    annotation.appendChild(annotationText);
    const annotationNumber = document.createElement('div');
    annotationNumber.id = 'annotation-index-' + id;
    annotationNumber.innerText = +id;
    annotationNumber.classList.add('annotation-number');
    annotationNumber.addEventListener('click', (e) =>  {
        e.stopPropagation();
        //console.log(e);
        this.hideAnnotation(annotationNumber.id.substring(17));
        //console.log(annotationNumber);
    });
    document.querySelector('#forgeViewer').appendChild(annotationNumber);
}

function setAnnotationPosition(id) {
    let p2 = new THREE.Vector3(annotations[id].x, annotations[id].y, annotations[id].z);
    if (!viewer.impl.camera.position.equals(p2)) {
        clientPos = viewer.impl.worldToClient(p2, viewer.impl.camera);
        p2.x = clientPos.x;
        p2.y = clientPos.y;
        document.querySelector('#annotation-' + id).style.left = p2.x + "px";
        document.querySelector('#annotation-' + id).style.top = p2.y + "px";
        document.querySelector('#annotation-index-' + id).style.left = p2.x + "px";
        document.querySelector('#annotation-index-' + id).style.top = p2.y + "px";
    }
}

function update() {
    for (const id in annotations) {
        let p2 = new THREE.Vector3(annotations[id].x, annotations[id].y, annotations[id].z);
        if (!viewer.impl.camera.position.equals(p2)) {
            clientPos = viewer.impl.worldToClient(p2, viewer.impl.camera);
            p2.x = clientPos.x;
            p2.y = clientPos.y;

            if(p2.x < 0 || p2.x > document.querySelector(".col-sm-8").clientWidth || p2.y < 0 || p2.y > document.querySelector(".col-sm-8").clientHeight) {
                document.querySelector('#annotation-' + id).classList.add("hidden");
                document.querySelector('#annotation-text-' + id).classList.add("hidden");
                document.querySelector('#annotation-index-' + id).classList.add("hidden");
            }else {
                if (!annotations[id].flagHidden) {
                    document.querySelector('#annotation-' + id).classList.remove("hidden");
                }
                document.querySelector('#annotation-text-' + id).classList.remove("hidden");
                document.querySelector('#annotation-index-' + id).classList.remove("hidden");
                //wasOutOfBounds = false;
            }
            document.querySelector('#annotation-' + id).style.left = p2.x + "px";
            document.querySelector('#annotation-' + id).style.top = p2.y + "px";
            document.querySelector('#annotation-index-' + id).style.left = p2.x + "px";
            document.querySelector('#annotation-index-' + id).style.top = p2.y + "px";
        }
    }
    
        this.changeVisibilityOfAnnotations();
    
}

function changeVisibilityOfAnnotations() {
    for (const id in annotations) {
        document.querySelector('#annotation-' + id).style.zIndex = this.getClosestAnnotation() == id ? 2 : 1;
        document.querySelector('#annotation-index-' + id).style.zIndex = this.getClosestAnnotation() == id ? 2 : 1;
    }
}
function getClosestAnnotation() {
    let indexOfClosest;
    let distToClosest = Math.pow(2, 32);
    for (const id in annotations) {
        const camPos = this.viewer.impl.camera.position;
        const pPos = annotations[id];
        const dist = Math.sqrt(Math.pow((camPos.x - pPos.x), 2) + Math.pow((camPos.y - pPos.y), 2) + Math.pow((camPos.z - pPos.z), 2));
        if (distToClosest > dist) {
            distToClosest = dist;
            indexOfClosest = +id;
        }
    }
    return indexOfClosest;
}

function annotationInit() {
    isStarted = true;
    onMouseMove();
}

function onMouseMove() {
    //window.requestAnimationFrame(onMouseMove);
    if (isStarted) {
        update();
    }
}

function setAnnotationRemoveMode() {
    annotationRemoveMode = !annotationRemoveMode;
    if (annotationRemoveMode)
    {
        input.value ="0";
        if (annotations.length == 0)
            input.setAttribute("max", "0");
        else
            input.setAttribute("max",annotations.length - 1);
        document.querySelector("#annotationRemoveText").classList.remove('hidden');
        document.querySelector("#annotationRemoveNumber").classList.remove('hidden');
        document.querySelector("#confirmRemoveAnnotation").classList.remove('hidden');
        document.querySelector("#stopAnnotationRemoveMode").classList.remove('hidden');
        if (annotationMode)
            setAnnotationMode();
    }
    else {
        document.querySelector("#annotationRemoveText").classList.add('hidden');
        document.querySelector("#annotationRemoveNumber").classList.add('hidden');
        document.querySelector("#confirmRemoveAnnotation").classList.add('hidden');
        document.querySelector("#stopAnnotationRemoveMode").classList.add('hidden');
    }
}

function removeAnnotation() {
    id = parseInt(document.querySelector("#annotationRemoveNumber").value, 10);
    let i = 0;
    for (i = id; i < annotations.length - 1; i++)
    {
        z = i + 1;

        let j = '#annotation-index-' + z;
        var element = document.querySelector(j);
        element.innerText = +i;
        element.id = 'annotation-index-' + i;
        j = '#annotation-' + z;
        element = document.querySelector(j);
        element.id = 'annotation-' + i;
        j = '#annotation-text-' + z;
        element = document.querySelector(j);
        var temp = element.innerText;
        element.id = 'annotation-text-' + i; 
        element.innerText = temp;

        annotations[i] = annotations[i+1];
    }
    var x = "annotation-index-" + id;
    var element = document.getElementById(x);
    element.parentNode.removeChild(element);
    x = "annotation-" + id;
    var element = document.getElementById(x);
    element.parentNode.removeChild(element);
    annotations.pop();

    if (annotations.length == 0)
        input.setAttribute("max", "0");
    else
        input.setAttribute("max",annotations.length - 1);
    if ((input.value > (annotations.length - 1)) && input.value != "0")
        input.value--;
}