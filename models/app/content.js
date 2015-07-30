var container;
var camera, controls, scene, renderer;
var cameras = [];

detect();

function detect(){

	if (Detector.webgl) {
	
	window.onload = function() {
		init();
		animate();
  }
		
	} else {
		var warning = Detector.getWebGLErrorMessage();
		document.getElementById('container').appendChild(warning);
	}  
}

function init() {

				var contentElem = window.document.getElementById('content');
				if(contentElem == null) //no UI mode
				{
					contentElem = document.createElement( 'div' );
					contentElem.id = 'content';
					document.body.insertBefore(contentElem, window.document.getElementById('footer'));
				};
				
//Progress Bar		
				var loaderElem = document.createElement( 'div' );
				loaderElem.id = 'loader';
				container = document.createElement( 'div' );
				container.id = "container";
				var circle = new ProgressBar.Circle(container, {
					color: '#000000',
					text: {
						value: '0'
							},
					step: function(state, bar) {
						bar.setText((bar.value() * 100).toFixed(0));
					}
				});

				
				loaderElem.appendChild( container );
				document.body.appendChild(loaderElem);
				loaderElem.style.display = "block";

//camera
				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
				camera.position.z = 100;
				camera.position.y = 100;
				
				camera.up = new THREE.Vector3( 0, 0, 1 );
				camera.lookAt(new THREE.Vector3(0, 0, 0 ));
	
//controls				
				controls = new THREE.OrbitControls( camera );
				controls.damping = 0.2;
				controls.addEventListener( 'change', render );

//scene				
				scene = new THREE.Scene();
				
//load assets
				var manager = new THREE.LoadingManager();
   				manager.onProgress = function ( item, loaded, total ) {

       				console.log( item, loaded, total );

   				};

				var loader = new THREE.ObjectLoader(manager);
			
				loader.load( 
					// resource URL coming from other file
					'data/data.json', 
					// Function when resource is loaded 
					function ( result ) 
					{ 	
						scene = result;
						processScene(scene);
						
					}, 
					// Function called when download progresses 
					function ( xhr ) 
					{ 
						//console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); 
					
						if((xhr.loaded / xhr.total)<1)
						{
							circle.set(xhr.loaded / xhr.total);
						}
				
						if((xhr.loaded / xhr.total)==1){
							circle.destroy();
							
							container.outerHTML = "";
							delete container;
							loaderElem.style.display = "none";
							
						} 
					}, 
					// Function called when download errors 
					function ( xhr ) 
					{ console.log( 'An error happened' ); } 
				);  

//render				
				renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

				renderer.setSize( contentElem.clientWidth, window.innerHeight );
  
         		renderer.shadowMapEnabled = true;
         		renderer.shadowMapSoft = true;
				
				/* renderer.shadowCameraNear = 3;
      			renderer.shadowCameraFar = camera.far;
      			renderer.shadowCameraFov = 50;

      			renderer.shadowMapBias = 0.0022;
      			renderer.shadowMapDarkness = 0.5;
      			renderer.shadowMapWidth = 2048;
      			renderer.shadowMapHeight = 2048; */
				
				contentElem.appendChild(renderer.domElement);
				
//events
         		window.addEventListener( 'resize', onWindowResize, false );
				window.addEventListener( 'layerOff', onLayerOff );
				window.addEventListener( 'layerOn', onLayerOn );
				window.addEventListener( 'viewChange', onViewChange );

         		render();
}

function processScene(scene)
{
	var g = new THREE.Geometry(); //for computing the scene BB
	var pc = new THREE.PointCloud();
	var pcId;
	var pcAdd = false;
	for(i = 0; i < scene.children.length; i++)
	{
		switch(scene.children[i].type)
		{
			case "Line":
				var divID = scene.children[i].userData[0].Layer.split(' ').join('_');
			
				
				if (!document.getElementById(divID)) {
					
					var data = {
						detail: {
							layer: scene.children[i].userData[0].Layer
						}
					}
					
					window.dispatchEvent( new CustomEvent( 'add-layer', data ) );
				}
			break;
			
			case "PointCloud":
			
				//scene.children[i].material.size = 5;
				//scene.children[i].material.sizeAttenuation = false;
				
				var divID = scene.children[i].userData[0].Layer.split(' ').join('_');
			
				
				if (!document.getElementById(divID)) {
					
					var data = {
						detail: {
							layer: scene.children[i].userData[0].Layer
						}
					}
					
					window.dispatchEvent( new CustomEvent( 'add-layer', data ) );
				}
			
				break;
				
			case "Mesh":
				
				if(scene.children[i].geometry.type != "TextGeometry")
				{
					scene.children[i].castShadow = true;
					scene.children[i].receiveShadow = true;
				}
							
				//scene.children[i].material.shading = 2;
				
							
				g.merge(scene.children[i].geometry);
				
				//console.log(scene.children[i].userData[0].Layer);
				var divID = scene.children[i].userData[0].Layer.split(' ').join('_');
			
				if (!document.getElementById(divID)) {
					
					var data = {
						detail: {
							layer: scene.children[i].userData[0].Layer
						}
					}
					
					window.dispatchEvent( new CustomEvent( 'add-layer', data ) );
				}
				
				//var g = w2ui['grid'].records.length;
				//w2ui['grid'].add( { recid: g + 1, fname: scene.children[i].userData[0].Layer} );
														
				break;
									
			case "DirectionalLight":
								
				scene.children[i].castShadow = true;
				//scene.children[i].shadowCameraVisible = true;

				scene.children[i].shadowMapWidth = 2048;
				scene.children[i].shadowMapHeight = 2048;

				g.computeBoundingSphere();
		
				var d = g.boundingSphere.radius * 2;

				scene.children[i].shadowCameraLeft = -d;
				scene.children[i].shadowCameraRight = d;
				scene.children[i].shadowCameraTop = d;
				scene.children[i].shadowCameraBottom = -d;

				scene.children[i].shadowCameraNear = 10;
				scene.children[i].shadowCameraFar = d*10;
				scene.children[i].shadowDarkness = 0.2;
				scene.children[i].shadowDarkness = 0.5;
				scene.children[i].shadowBias = -0.00001; 
				
				break;
									
			case "SpotLight":
				scene.children[i].castShadow = true;
				//also need to add spotlight parameters

				break;	
				
			case "PerspectiveCamera":
			
				var cam = new THREE.PerspectiveCamera( scene.children[i].fov, scene.children[i].aspect, scene.children[i].near, scene.children[i].far);
				cam.up = new THREE.Vector3( 0, 0, 1 );
				cam.name = scene.children[i].name;
				cam.userData = scene.children[i].userData;
				
				//console.log(cam);
				cameras.push(cam);
			
				camera = scene.children[i];
				camera.up = new THREE.Vector3( 0, 0, 1 );
				
				controls = new THREE.OrbitControls( camera );
				controls.target = new THREE.Vector3( scene.children[i].userData[0].tX, scene.children[i].userData[0].tY, scene.children[i].userData[0].tZ );
				
				
				//add to views
				
				var divID = scene.children[i].name.split(' ').join('_');
				//console.log("Perspective View? " + divID);
				if (!document.getElementById(divID)) {
					
					var data = {
						detail: {
							viewName: scene.children[i].name,
							viewID: divID
						}
					}
					
					window.dispatchEvent( new CustomEvent( 'add-view', data ) );
				} 
				
				break;
									
			default:
			//console.log("not sure!");
				break;					
		}		
	}
	
	if(pcAdd)
	{
		scene.add(pc);
		scene.remove(scene.children[pcId]);
	}
	
	var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );
	
	console.log(scene);
	
}

function onWindowResize() {

         camera.aspect = window.innerWidth / window.innerHeight;
         camera.updateProjectionMatrix();

         renderer.setSize( window.innerWidth, window.innerHeight );

         render();
}

function onLayerOff(event)
{
		for(var i = 0; i < scene.children.length; i++)
		{
			if(scene.children[i].type == "Mesh" || scene.children[i].type == "PointCloud" || scene.children[i].type == "Line" )
			{
				if(event.detail.layer == scene.children[i].userData[0].Layer)
				{
					scene.children[i].visible = false;
				}
			}
		}
	
}

function onLayerOn(event)
{
		for(var i = 0; i < scene.children.length; i++)
		{
			if(scene.children[i].type == "Mesh" || scene.children[i].type == "PointCloud" || scene.children[i].type == "Line")
			{
				if(event.detail.layer == scene.children[i].userData[0].Layer)
				{
					scene.children[i].visible = true;
				}
			}
		}
	
}

function onViewChange(event)
{
	var cam = scene.getObjectByName( event.detail.view );
	
	/* for(var i = 0; i < cameras.length; i++)
	{
		if(cameras[i].name == event.detail.view)
		{
			console.log('yes camera');
			
			camera = cameras[i];
			camera.up = new THREE.Vector3( 0, 0, 1 );
				
			controls = new THREE.OrbitControls( camera );
			controls.target = new THREE.Vector3( camera.userData[0].tX, camera.userData[0].tY, camera.userData[0].tZ ); 
			
		}
	} */
	
	camera = cam;
	camera.up = new THREE.Vector3( 0, 0, 1 );
				
	controls = new THREE.OrbitControls( camera );
	controls.target = new THREE.Vector3( camera.userData[0].tX, camera.userData[0].tY, camera.userData[0].tZ ); 
	
	//console.log(cam);
	
	
}


function animate() {

         requestAnimationFrame( animate );
         controls.update();
		 render();
}

function render() {

         renderer.render( scene, camera );

}

