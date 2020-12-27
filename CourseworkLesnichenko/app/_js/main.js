const objectID = "helicoid";
// global variables
let renderer;
let scene;
let camera;
let camControls;

let lightRadius = 50;
let rotationStep = 0.1;
let pivotPoint;

let texture;

function setupEnvironment() {
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();

    // create a render, sets the background color and the size
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xAAAAAA, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camControls = new THREE.TrackballControls(camera);

    addPointLight();
    addDirectionalLight()
}

const Figure = {
    c: 10,     // radius
    a: 1,
    b: 10 / Math.PI,
    O: Math.PI / 4,

    transformUV(u1, v1) {
        const u = u1 * Math.PI * 2;
        const v = v1 * 8 * Math.PI;

        return {u, v};
    },

    x0(v) {
        return this.c * Math.pow(Math.cos(v), 3)
    },
    y0(v) {
        return this.c * Math.pow(Math.sin(v), 3)
    },
    f(u, v) {
        let x = (this.a + this.x0(v) * Math.cos(this.O) + this.y0(v) * Math.sin(this.O)) * Math.cos(u);
        let y = (this.a + this.x0(v) * Math.cos(this.O) + this.y0(v) * Math.sin(this.O)) * Math.sin(u);
        let z = this.b * u - this.x0(v) * Math.sin(this.O) + this.y0(v) * Math.cos(this.O);

        return {x, y, z}
    },

    dx0(v) {
        return -3 * this.c * Math.sin(v) * Math.pow(Math.cos(v), 2)
    },
    dy0(v) {
        return 3 * this.c * Math.cos(v) * Math.pow(Math.sin(v), 2)
    },
    DfDu(u, v) {
        const dxdu = -1 * (this.a + this.x0(v) * Math.cos(this.O) + this.y0(v) * Math.sin(this.O)) * Math.sin(u);
        const dydu = (this.a + this.x0(v) * Math.cos(this.O) + this.y0(v) * Math.sin(this.O)) * Math.cos(u);
        const dzdu = this.b;

        return {dxdu, dydu, dzdu};
    },
    DfDv(u, v) {
        const dxdv = (this.dx0(v) * Math.cos(this.O) + this.dy0(v) * Math.sin(this.O)) * Math.cos(u);
        const dydv = (this.dx0(v) * Math.cos(this.O) + this.dy0(v) * Math.sin(this.O)) * Math.sin(u);
        const dzdv = this.dx0(v) * Math.sin(this.O) + this.dy0(v) * Math.cos(this.O);

        return {dxdv, dydv, dzdv};
    }
};

const vectorAttrs = {
    colorNormal: 0xFFFFFF,
    colorTangU: 0xFF0000,
    colorTangV: 0x0000FF,
    normal: null,
    vU: null,
    vV: null,
    helperN: null,
    helperU: null,
    helperV: null,
    u: 0,
    set setU(value) {
        this.u = value;
    },
    v: 0,
    set setV(value) {
        if (value > Math.PI / 4) {
            this.v = Math.PI / 4;
        } else if (value < 0) {
            this.v = 0;
        } else {
            this.v = value;
        }
    },

    p: null,
    start: null,
    step: 0.01,
    vSize: 10,
    reset: function () {
        killVectors();
        this.normal = null;
        this.vU = null;
        this.vV = null;
        this.helperN = null;
        this.helperU = null;
        this.helperV = null;
        this.p = null;
        this.start = null;
        doCourseWork();
    },
};

function createAstroidalHelicoid() {
    let AstroidalHelicoid = function (u1, v1, target) {
        const {u, v} = Figure.transformUV(u1, v1);
        const {x, y, z} = Figure.f(u, v);
        target.set(x, y, z);
    };

    // create a figure
    let geom = new THREE.ParametricGeometry(AstroidalHelicoid, 100, 100);
    createTexture();
    console.log("texture" + texture);
    let mat = new THREE.MeshPhongMaterial({
        // color: 0xcc3333a,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading,
        wireframe: false/*,
        map: texture*/
    });

    let mesh = new THREE.Mesh(geom, mat);
    mesh.name = objectID;
    // let scale = 1;
    // mesh.scale.set(scale, scale, scale);
    // mesh.position.z = -45;
    return mesh
}

function addPointLight() {
    // create a sphere orientir
    var sphere = new THREE.SphereGeometry(0.001, 20, 20);
    var spherMat = new THREE.MeshLambertMaterial({color: 0x5555ff});
    var sphereMesh = new THREE.Mesh(sphere, spherMat);
    sphereMesh.receiveShadow = true;
    sphereMesh.position.set(0, 0, 0);
    scene.add(sphereMesh);

    // add an object as pivot point to the sphere
    pivotPoint = new THREE.Object3D();
    pivotPoint.rotation.x = 0.4;
    pivotPoint.name = 'pointLight';
    sphereMesh.add(pivotPoint);

    const light = new THREE.PointLight(0xffffff, 2, 300, 2);
    light.name = 'light';
    light.position.set(0, -lightRadius, lightRadius);
    scene.add(light);

    // create a sphere for light
    var sphere = new THREE.SphereGeometry(1, 20, 20);
    var spherMat = new THREE.MeshLambertMaterial({color: 0x5555ff});
    var sphereMesh = new THREE.Mesh(sphere, spherMat);
    sphereMesh.receiveShadow = true;
    sphereMesh.position.set(light.position.x, light.position.y, light.position.z);
    // make the pivotpoint the light's parent.
    pivotPoint.add(light);
    pivotPoint.add(sphereMesh);
}

function addDirectionalLight() {
    let directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(0, lightRadius, -lightRadius);
    directionalLight.name = 'directionalLight';
    scene.add(directionalLight);
}

function createTexture() {
    const c_red = '#ff0000';
    const c_orange = '#ff7700';
    const c_yellow = '#ffff00';
    const c_green = '#00ff00';
    const c_lightblue = '#00ccff';
    const c_blue = '#0000ff';
    const c_violet = '#8800ff';

    texture = new THREE.CanvasTexture(document.createElement("canvas"));
    texture.mipmaps[0] = makeMipmap(128, '#494949');
    texture.mipmaps[1] = makeMipmap(64, c_violet);
    texture.mipmaps[2] = makeMipmap(32, c_blue);
    texture.mipmaps[3] = makeMipmap(16, c_lightblue);
    texture.mipmaps[4] = makeMipmap(8, c_green);
    texture.mipmaps[5] = makeMipmap(4, c_yellow);
    texture.mipmaps[6] = makeMipmap(2, c_orange);
    texture.mipmaps[7] = makeMipmap(1, c_red);
    texture.repeat.set(16, 16);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipmapNearestFilter;
    texture.magFilter = THREE.NearestFilter
}

function makeMipmap(s, color) {
    const imageCanvas = document.createElement("canvas");
    imageCanvas.width = s;
    imageCanvas.height = s;
    const context = imageCanvas.getContext("2d");
    context.fillStyle = color;
    context.fillRect(0, 0, s, s);
    context.fillRect(s, s, s, s);
    return context.getImageData(0, 0, s, s)
}

function visualizePoint(x, y, z) {
    const geometry = new THREE.SphereGeometry(0, 0, 0);
    const material = new THREE.MeshBasicMaterial({color: 0x000000});
    let scale = 0.4;
    vectorAttrs.p = new THREE.Mesh(geometry, material);
    vectorAttrs.p.scale.set(scale, scale, scale);
    vectorAttrs.p.position.set(x, y, z);
    scene.add(vectorAttrs.p);
}

function killVectors() {
    scene.remove(vectorAttrs.normal);
    scene.remove(vectorAttrs.vU);
    scene.remove(vectorAttrs.vV);
    scene.remove(vectorAttrs.helperN);
    scene.remove(vectorAttrs.helperU);
    scene.remove(vectorAttrs.helperV);
    scene.remove(vectorAttrs.p);
    scene.remove(vectorAttrs.start);
}

function makeTangU(u, v, x, y, z) {
    let {dxdu, dydu, dzdu} = Figure.DfDu(u, v);
    let tu = new THREE.Vector3(dxdu, dydu, dzdu);

    tu.normalize();
    vectorAttrs.vU = tu;
    vectorAttrs.start = new THREE.Vector3(x, y, z);
    vectorAttrs.helperU = new THREE.ArrowHelper(
        vectorAttrs.vU,
        vectorAttrs.start,
        vectorAttrs.vSize,
        vectorAttrs.colorTangU
    );
    scene.add(vectorAttrs.helperU);
}

function makeTangV(u, v, x, y, z) {
    let {dxdv, dydv, dzdv} = Figure.DfDv(u, v);
    let tv = new THREE.Vector3(dxdv, dydv, dzdv);

    tv.normalize();
    vectorAttrs.vV = tv;
    vectorAttrs.start = new THREE.Vector3(x, y, z);

    vectorAttrs.helperV = new THREE.ArrowHelper(
        vectorAttrs.vV,
        vectorAttrs.start,
        vectorAttrs.vSize,
        vectorAttrs.colorTangV
    );
    scene.add(vectorAttrs.helperV);
}

function makeNormal(x, y, z) {
    vectorAttrs.normal = new THREE.Vector3();
    vectorAttrs.normal.crossVectors(vectorAttrs.vU, vectorAttrs.vV);
    vectorAttrs.normal.normalize();
    vectorAttrs.start = new THREE.Vector3(x, y, z);

    vectorAttrs.helperN = new THREE.ArrowHelper(
        vectorAttrs.normal,
        vectorAttrs.start,
        vectorAttrs.vSize,
        vectorAttrs.colorNormal
    );

    scene.add(vectorAttrs.helperN);
}

function makeVectors(u, v, x, y, z) {
    makeTangU(u, v, x, y, z);
    makeTangV(u, v, x, y, z);
    makeNormal(x, y, z);
}

function doCourseWork() {
    const [u1, v1] = [vectorAttrs.u, vectorAttrs.v];
    console.log(u1 + ", " + v1);
    const {u, v} = Figure.transformUV(u1, v1);
    console.log(u + ", " + v);

    const {x, y, z} = Figure.f(u, v);

    visualizePoint(x, y, z);
    makeVectors(u, v, x, y, z);
}

function init() {
    setupEnvironment();
    let mesh = createAstroidalHelicoid();
    scene.add(mesh);

    // position and point the camera to the center of the scene
    camera.position.x = 200;
    camera.position.y = 0;
    camera.position.z = 0;
    camera.lookAt(new THREE.Vector3(0, 0, 0));


    // add the output of the renderer to the html element
    document.body.appendChild(renderer.domElement);

    addControls();
    setupKeyControls();

    doCourseWork();

    // call the render function
    render();
}

function addControls() {
    let gui = new dat.GUI();

    let controlObject = new function () {
        this.wireframe = function () {
            let material = scene.getObjectByName(objectID).material;
            material.wireframe = !material.wireframe;
        };
        this.pointLight = function () {
            let light = scene.getObjectByName('pointLight');
            light.visible = !light.visible;
        };
        this.directionalLight = function () {
            let light = scene.getObjectByName('directionalLight');
            light.visible = !light.visible;
        };
    };

    gui.add(controlObject, 'wireframe');
    gui.add(controlObject, 'pointLight');
    gui.add(controlObject, 'directionalLight');
    const directionalLightPos = scene.getObjectByName('directionalLight').position;

    const ignoreList = [];
    ignoreList.push(gui.add(directionalLightPos, 'x', -300, 300));
    ignoreList.push(gui.add(directionalLightPos, 'y', -300, 300));
    ignoreList.push(gui.add(directionalLightPos, 'z', -300, 300));

    ignoreList.forEach(item => {
            item.onChange(function (_) {
                camControls.enabled = false
            });
            item.onFinishChange(function (_) {
                camControls.enabled = true
            })
        }
    )
}

function setupKeyControls() {
    document.onkeydown = function (e) {
        switch (e.keyCode) {
            case 37:
                // left
                pivotPoint.rotation.z -= rotationStep;
                break;
            case 38:
                // up
                pivotPoint.rotation.x -= rotationStep;
                break;
            case 39:
                // right
                pivotPoint.rotation.z += rotationStep;
                break;
            case 40:
                // down
                pivotPoint.rotation.x += rotationStep;
                break;

            // WASD
            case 87:
                // W
                vectorAttrs.setV = vectorAttrs.v + vectorAttrs.step;
                vectorAttrs.reset();
                break;
            case 65:
                // A
                vectorAttrs.setU = vectorAttrs.u - vectorAttrs.step;
                vectorAttrs.reset();
                break;
            case 83:
                // S
                vectorAttrs.setV = vectorAttrs.v - vectorAttrs.step;
                vectorAttrs.reset();
                break;
            case 68:
                // D
                vectorAttrs.setU = vectorAttrs.u + vectorAttrs.step;
                vectorAttrs.reset();
                break;
        }
    };
}

function render() {
    renderer.render(scene, camera);
    scene.getObjectByName(objectID).rotation.x += 0.00;
    scene.getObjectByName(objectID).rotation.y += 0.00;
    requestAnimationFrame(render);
    camControls.update();
}

// calls the init function when the window is done loading.
window.onload = init;