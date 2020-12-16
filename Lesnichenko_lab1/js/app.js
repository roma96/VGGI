// Lesnichenko Lab1
window.onload = function(){

    var funcForVisualize = function ( v, u, target ) {        
        u *= 12 * Math.PI;
		v *= 2 * Math.PI;
        a = 0.5;
        R = 4;
        var x, y, z;
        x = (R + a * Math.cos(u/2)) * Math.cos(u/3) + a * Math.cos(u/3) * Math.cos(v - Math.PI);
		y = (R + a * Math.cos(u/2)) * Math.sin(u/3) + a * Math.sin(u/3) * Math.cos(v - Math.PI);
        z = a + Math.sin(u/2) + a * Math.sin(v - Math.PI);
        target.set( x, y, z );
    };

    function onDocumentMouseDown( event ) {
        var onDocumentMouseUp = function( event ) {
            document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
            document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
            document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
        }
        var onDocumentMouseOut= function ( event ) {
            document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
            document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
            document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
        }
        var onDocumentMouseMove = function ( event ) {
            mouse_x = event.clientX - w_h_fx;
            TR_X = ( mouse_x - mouse_on_md ) * 0.00025;
            mouse_y = event.clientY - w_h_fy;
            TR_Y = ( mouse_y - mouse_y_on_md ) * 0.00025;
        }
        document.onclick = function() {
            unpack_alignment--;
            if(unpack_alignment < 0.15){
                close()
            }
        };
        event.preventDefault();
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );
        document.addEventListener( 'mouseout', onDocumentMouseOut, false );
        mouse_on_md = event.clientX - w_h_fx;
        mouse_y_on_md = event.clientY - w_h_fy;
    }

    function render() {

        function rotateAroundWorldAxis( object, axis, radians ) {
            var rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationAxis( axis.normalize(), radians );
            rotationMatrix.multiply( object.matrix );                      
            object.matrix = rotationMatrix;
            object.rotation.setFromRotationMatrix( object.matrix );
        }
        rotateAroundWorldAxis(figure, new THREE.Vector3(0, 1, 0), TR_X);
        rotateAroundWorldAxis(figure, new THREE.Vector3(1, 0, 0), TR_Y);
        TR_Y = TR_Y * (1 - slowing_factor);
        TR_X = TR_X * (1 - slowing_factor);
        renderer.render( scene, camera );
    }

    function init() {
        container = document.createElement( 'div' );
        document.body.appendChild( container );
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x444444 );
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.z = 50;
        scene.add( camera );                            
        var geometry = new THREE.ParametricGeometry( funcForVisualize , 25, 25 );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, vertexColors:THREE.FaceColors} );
        for(var i = 0;i<geometry.faces.length;i++){
            geometry.faces[i].color.setRGB(Math.random(),Math.random(),Math.random())
        }
        figure = new THREE.Mesh( geometry, material );
        scene.add(figure);
        figure.material.side = THREE.DoubleSide;   
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );
        document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    }

    function animate() {
        requestAnimationFrame( animate );
        render();
    }

    var container;
    var camera, scene, renderer;
    var TR_X = 0.5;
    var TR_Y = 0.2;
    var mouse_x = 0;
    var mouse_on_md = 0;
    var mouse_y = 0;
    var mouse_y_on_md = 0; 
    var w_h_fx = window.innerWidth / 2;
    var w_h_fy = window.innerHeight / 2;
    var unpack_alignment = 10;
    var slowing_factor = 0.15;

    init();
    animate();

}

