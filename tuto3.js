var renderer, scene, camera, distance, raycaster, projector;
//get our <DIV> container
var container = document.getElementById('container');
// Helper var wich we will use as a additional correction coefficient for objects and camera
var distance = 400;

//Raycasting used for element picking
var raycaster = new THREE.Raycaster(),INTERSECTED;
var mouse = new THREE.Vector2();



init();
animate();
function init() {
    //init render
      renderer = new THREE.WebGLRenderer({antialias: true});
      //render window size
      renderer.setSize(window.innerWidth, window.innerHeight);
      //background color
      renderer.setClearColor(0x140b33, 1);
      //append render to the <DIV> container
      container.appendChild(renderer.domElement);
  
    //init scene, camera and camera position
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.2, 25000);
      camera.position.set(100, -400, 2000);
      //adding camera to the scene
      scene.add(camera);
  
    //LIGHTNING
      //first point light
      light = new THREE.PointLight(0xffffff, 1, 4000);
      light.position.set(50, 0, 0);
      //the second one
      light_two = new THREE.PointLight(0xffffff, 1, 4000);
      light_two.position.set(-100, 800, 800);
      //And another global lightning some sort of cripple GL
      lightAmbient = new THREE.AmbientLight(0x404040);
      scene.add(light, light_two, lightAmbient);
  
  
    //OBJECTS
      //here we add objects by functions which we will write below
      createSpheres();
      createDiamond();
      createSpace();
  
      //adding scene and camera to the render
      renderer.render(scene, camera);
      window.addEventListener('resize', onWindowResize, false);
      document.addEventListener('mousemove', onMouseMove, false);
      document.addEventListener('mousedown', onDocumentMouseDown, false);
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    //original example from here https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_pointlights.html
      var timer = 0.00001 * Date.now();
    //come up with random animation
      for (var i = 0, l = diamondsGroup.children.length; i < l; i++) {
          var object = diamondsGroup.children[i];
          object.position.y = 500 * Math.cos(timer + i);
          object.rotation.y += Math.PI / 500;
      }
      for (var i = 0, l = spheres.children.length; i < l; i++) {
          var object = spheres.children[i];
          object.rotation.y += Math.PI / 60;
          if (i < 20) {
              object.rotation.y -= Math.PI / 40;
          }
      }
  //add in the render
      renderer.render(scene, camera);

    //update raycaster with mouse movement  
    raycaster.setFromCamera(mouse, camera);
    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(diamondsGroup.children);
  //count and look after all objects in the diamonds group
    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            //setting up new material on hover
            INTERSECTED.material.emissive.setHex(Math.random() * 0xff00000 - 0xff00000);
        }
    } else {
        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        INTERSECTED = null;
    }  
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
}

function onMouseMove(event) {
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
    camera.position.x += (mouseX - camera.position.x) * 0.005;
    camera.position.y += (mouseY - camera.position.y) * 0.005;
    //set up camera position
    camera.lookAt(scene.position);
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(diamondsGroup.children);
    if (intersects.length > 0) {
    //get a link from the userData object
        window.open(intersects[0].object.userData.URL);
    }
}

  function createSpheres() {
    //create empty 3d object — group for future spheres
    spheres = new THREE.Object3D();
    //randomly create 80 spheres by loop
        for (var i = 0; i < 80; i++) {
            var sphere = new THREE.SphereGeometry(4, Math.random() * 12, Math.random() * 12);
            var material = new THREE.MeshPhongMaterial({
                color: Math.random() * 0xff00000 - 0xff00000,
                shading: THREE.FlatShading,
            });
    
        //creating the mesh and add primitive and material
            var particle = new THREE.Mesh(sphere, material);
            //randomly set position and scale
            particle.position.x = Math.random() * distance * 10;
            particle.position.y = Math.random() * -distance * 6;
            particle.position.z = Math.random() * distance * 4;
            particle.rotation.y = Math.random() * 2 * Math.PI;
            particle.scale.x = particle.scale.y = particle.scale.z = Math.random() * 12 + 5;
            //add particle to the spheres group
            spheres.add(particle);
        }
    
        //correct spheres position relative to the camera
        spheres.position.y = 500;
        spheres.position.x = -2000;
        spheres.position.z = -100;
        spheres.rotation.y = Math.PI * 600;
        //add spheres to the scene
        scene.add(spheres);
    }

    function createDiamond() {
        //create a group container
          diamondsGroup = new THREE.Object3D();
        //setting up loader for a model
          var loader = new THREE.JSONLoader();
        //load model and clone it 
       loader.load('https://raw.githubusercontent.com/PavelLaptev/test-rep/master/threejs-post/diamond.json', function(geometry) {
              for (var i = 0; i < 60; i++) {
                  var material = new THREE.MeshPhongMaterial({
                      color: Math.random() * 0xff00000 - 0xff00000,
                      shading: THREE.FlatShading
                  });
                  var diamond = new THREE.Mesh(geometry, material);
                  //create array with any links
                  var arr = ['https://link',
                      'https://link',
                      'https://link',
                      'https://link'
                  ];
                  //and randomly push it into userData object
                  diamond.userData = {
                      URL: arr[Math.floor(Math.random() * arr.length)]
                  };
                  diamond.position.x = Math.random() * -distance * 6;
                  diamond.position.y = Math.random() * -distance * 2;
                  diamond.position.z = Math.random() * distance * 3;
                  diamond.rotation.y = Math.random() * 2 * Math.PI;
                  diamond.scale.x = diamond.scale.y = diamond.scale.z = Math.random() * 50 + 10;
                  diamondsGroup.add(diamond);
              }
      
              diamondsGroup.position.x = 1400;
              scene.add(diamondsGroup);
              
              //we will delete this line later
              renderer.render(scene, camera);
          });
      }

      function createSpace() {

        dots = new THREE.Object3D();
    
        for (var i = 0; i < 420; i++) {
            var circleGeometry = new THREE.SphereGeometry(2, Math.random() * 5, Math.random() * 5);
            //change meterial
            var material = new THREE.MeshBasicMaterial({
                color: Math.random() * 0xff00000 - 0xff00000,
                shading: THREE.FlatShading,
            })
            var circle = new THREE.Mesh(circleGeometry, material);
            material.side = THREE.DoubleSide;
    
            circle.position.x = Math.random() * -distance * 60;
            circle.position.y = Math.random() * -distance * 6;
            circle.position.z = Math.random() * distance * 3;
            circle.rotation.y = Math.random() * 2 * Math.PI;
            circle.scale.x = circle.scale.y = circle.scale.z = Math.random() * 6 + 5;
            dots.add(circle);
        }
    
        dots.position.x = 7000;
        dots.position.y = 900;
        dots.position.z = -2000;
        dots.rotation.y = Math.PI * 600;
        dots.rotation.z = Math.PI * 500;
    
        scene.add(dots);
    }