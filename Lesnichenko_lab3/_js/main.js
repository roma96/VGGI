// Lesnichemko, laboratory work №3
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

function createAstroidalHelicoid() {
    let c = 10;     // radius
    let a = 1;
    let b = c / Math.PI;
    let O = Math.PI / 4;

    function x0(v) {
        return c * Math.pow(Math.cos(v), 3)
    }

    function y0(v) {
        return c * Math.pow(Math.sin(v), 3)
    }

    let AstroidalHelicoid = function (u, v, target) {
        var u = u * Math.PI * 2;
        var v = v * 8 * Math.PI;

        let x = (a + x0(v) * Math.cos(O) + y0(v) * Math.sin(O)) * Math.cos(u);
        let y = (a + x0(v) * Math.cos(O) + y0(v) * Math.sin(O)) * Math.sin(u);
        let z = b * u - x0(v) * Math.sin(O) + y0(v) * Math.cos(O);

        target.set(x, y, z);
        // return new THREE.Vector3(x, y, z);
    };

    // create a figure
    let geom = new THREE.ParametricGeometry(AstroidalHelicoid, 100, 100);
    createTexture();
    console.log("texture" + texture);
    let mat = new THREE.MeshPhongMaterial({
        // color: 0xcc3333a,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading,
        wireframe: false,
        map: texture
    });

    let mesh = new THREE.Mesh(geom, mat);
    mesh.name = objectID;
    let scale = 3;
    mesh.scale.set(scale, scale, scale);
    mesh.position.z = -45;
    return mesh
}

function addPointLight() {
    // create a sphere orientir
    // var sphere = new THREE.SphereGeometry(3, 20, 20);
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

    const light = new THREE.PointLight(0xffffff, 7, 500, 2);
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

function init() {
    setupEnvironment();
    let mesh = createAstroidalHelicoid();
    scene.add(mesh);

    // position and point the camera to the center of the scene
    camera.position.x = 0;
    camera.position.y = -200;
    camera.position.z = 100;
    camera.lookAt(new THREE.Vector3(0, 0, 0));


    // add the output of the renderer to the html element
    document.body.appendChild(renderer.domElement);

    addControls();
    setupKeyControls();

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