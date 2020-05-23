document.querySelector("#forgeViewer").addEventListener("click", onMouseClick);

let annotations = [];
let annotationMode = false;
let isStarted = false;

function onMouseClick(e) {
    const x = e.clientX - document.querySelector("#left").clientWidth - 15, 
    y = e.clientY - document.querySelector("#top").clientHeight;
    
    console.log(x,y);

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
        text: annotationText
    };
    displayAnnotation(id);
    setAnotationPosition(id);
}

document.addEventListener('mousemove', onMouseMove, false);

function hideAnnotation(id) {
    const annotation = document.querySelector('#annotation-' + id);
    const hidden = annotation.classList.contains('hidden');
    document.querySelector('#annotation-text-' + id).innerHTML = hidden ? annotations[id].text : '';
    if (hidden) {
        annotation.classList.remove('hidden');
        annotation.classList.remove('off');
    }
    else {
        annotation.classList.add('hidden');
        annotation.classList.add('off');
    }
}

function setAnotationMode() {
    annotationMode = !annotationMode;
    if (annotationMode) {
        document.querySelector("#annotationText").classList.remove('hidden');
    } else {
        document.querySelector("#annotationText").classList.add('hidden');
    }
}

function displayAnnotation(id) {
    const annotation = document.createElement('div');
    annotation.id = 'annotation-' + id;
    annotation.classList.add('annotation');
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
        this.hideAnnotation(id);
    });
    document.querySelector('#forgeViewer').appendChild(annotationNumber);
}

function setAnotationPosition(id) {
    let p2 = new THREE.Vector3(annotations[id].x, annotations[id].y, annotations[id].z);
    if (!viewer.impl.camera.position.equals(p2)) {
        clientPos = viewer.impl.worldToClient(p2, viewer.impl.camera);
        p2.x = clientPos.x;
        p2.y = clientPos.y;
        document.querySelector('#annotation-' + id).style.left = p2.x + "px";
        document.querySelector('#annotation-' + id).style.top = p2.y + "px";
        document.querySelector('#annotation-index-' + id).style.left = p2.x - 15 + "px";
        document.querySelector('#annotation-index-' + id).style.top = p2.y - 15 + "px";
    }
}

function update() {
    for (const id in annotations) {
        let p2 = new THREE.Vector3(annotations[id].x, annotations[id].y, annotations[id].z);
        if (!viewer.impl.camera.position.equals(p2)) {
            clientPos = viewer.impl.worldToClient(p2, viewer.impl.camera);
            p2.x = clientPos.x;
            p2.y = clientPos.y;
            if (p2.x < 15 || p2.y > 800) {
                document.querySelector('#annotation-' + id).classList.add('hidden');
                document.querySelector('#annotation-index-' + id).classList.add('hidden');
            } else {
                if (!(document.querySelector('#annotation-' + id).classList.contains('off'))) {
                    document.querySelector('#annotation-' + id).classList.remove('hidden');
                }
                document.querySelector('#annotation-index-' + id).classList.remove('hidden');
            }
            document.querySelector('#annotation-' + id).style.left = p2.x + "px";
            document.querySelector('#annotation-' + id).style.top = p2.y + "px";
            document.querySelector('#annotation-index-' + id).style.left = p2.x - 15 + "px";
            document.querySelector('#annotation-index-' + id).style.top = p2.y - 15 + "px";
        }
    }
    if (annotations.length > 0) {
        this.changeVisibilityOfAnnotations();
    }
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
}

function onMouseMove() {
    window.requestAnimationFrame(onMouseMove);
    if (isStarted) {
        update();
    }
}