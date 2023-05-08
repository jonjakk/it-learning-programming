import * as THREE from 'three';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { Primrose } from '/static/assets/js/libs/primrose.js';

(function(window) {

  'use strict';

  class ThreeMaze {
    constructor(wrapper, button) {
      // Object attributes
      this.wrapper = wrapper;
      this.camera = {};
      this.cameraHelper = {};
      this.scene = new THREE.Scene();
      this.materials = {};
      this.map = [];
      this.renderer = {};
      this.player = {};
      this.end = {};
      this.side = 31;
      this.thickness = 20;
      this.current_level = 0;
      this.new_map = [];
      this.end_x = 1;
      this.end_y = 1;
      this.editor = new Primrose({
        element: document.querySelector("primrose")
      });
      this.modal = document.getElementById("myModal");
      this.closeButton = document.getElementsByClassName("close")[0];

      // Inits
      retrieveMaze(this).then(() => {
        this.initScene();
        this.onWindowResize();
        this.render();
      });

      // Events
      this.wrapper.addEventListener('mousemove', this.onMouseMove.bind(this));
      this.wrapper.addEventListener('mousedown', this.onMouseDown.bind(this));
      this.wrapper.addEventListener('mouseup', this.onMouseUp.bind(this));
      button.addEventListener('click', () => {
        this.onGenerateMaze();
        setTimeout(() => {
          this.simulateMaze();
        }, 800);
      });
      this.onGenerateMaze();
      window.addEventListener('resize', this.onWindowResize.bind(this));
      document.addEventListener('keydown', this.onKeyDown.bind(this));

      // When the user clicks anywhere outside of the modal, close it
      window.onclick = (event) => {
        if (event.target == this.modal) {
          this.modal.style.display = "none";
        }
      }
      // When the user clicks the close button, close the modal
      this.closeButton.onclick = () => {
        this.modal.style.display = "none";
      }
    }
  };

  async function retrieveMaze(instance) {

    const setData = (map, sideValue) => {
      instance.new_map = map;
      instance.side = sideValue;
    }

    try {
      const response = await fetch(`/maze/${instance.current_level}`);
      const data = await response.json();
      setData(data[0].map, data[0].side);
    } catch (error) {
      console.error(error);
    }
  }
  ThreeMaze.prototype.simulateMaze = function() {
    const data = {
        maze_id: this.current_level,
        code: this.editor.value
      };
      // Show the loading overlay
  setLoadingOverlayVisible(true);
    //POST request to codecheck endpoint
    fetch('/mock_codecheck', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            // Hide the loading overlay
      setLoadingOverlayVisible(false);
            // simulate going the path that was given by pressing the right keys depending on where you want to go
            var upArrowEvent = new KeyboardEvent("keydown", { keyCode: 38 });
            var downArrowEvent = new KeyboardEvent("keydown", { keyCode: 40 });
            var leftArrowEvent = new KeyboardEvent("keydown", { keyCode: 37 });
            var rightArrowEvent = new KeyboardEvent("keydown", { keyCode: 39 });

            for (var i = 1; i < data.path_taken.length; i++) {
                const [prevX, prevY] = data.path_taken[i - 1];
                const [currentX, currentY] = data.path_taken[i];

                setTimeout(() => {
                    if (currentX < prevX) { // When moving right in the flipped maze, currentX will be less than prevX
                        document.dispatchEvent(downArrowEvent);
                    } else if (currentX > prevX) { // When moving left in the flipped maze, currentX will be greater than prevX
                        document.dispatchEvent(leftArrowEvent);
                    } else if (currentY > prevY) {
                        document.dispatchEvent(upArrowEvent);
                    } else if (currentY < prevY) {
                        document.dispatchEvent(rightArrowEvent);
                    }
                }, 500 * i);
            }

            // pop up a modal with the result
            var modalText = document.getElementById("modalText");
            //Display Code in special primrose canvas
            const prim_code = new Primrose({});
            prim_code.value = data.code;
            const prim_translated = new Primrose({});
            prim_translated.value = data.translated_pseudo_code;
            console.log(prim_code.value);
            console.log(prim_translated.value);

            Promise.all([
                createVisibleCanvasFromOffscreen(prim_code),
                createVisibleCanvasFromOffscreen(prim_translated),
              ]).then(([visiblePrimCodeCanvas, visiblePrimTranslatedCanvas]) => {
                modalText.innerHTML =
                  "<p>Your Score was :</p> <p>" +
                  data.score +
                  "</p> <br><p> This is our Feedback: </p><br> <p>" + data.feedback;
                modalText.innerHTML +=
                  "<br><br> <p>This is the code that is was translated to: </p><br>";
                modalText.appendChild(visiblePrimTranslatedCanvas); // Add the prim_translated's visible canvas to the modalText
              });
            
            //show the Modal
            this.modal.style.display = "block";

            // if result is true, set current_level to current_level + 1
            if (data.result) {
                this.current_level += 1;
            }
        }
        )
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            // Hide the loading overlay
            setLoadingOverlayVisible(false);
        });

};

function createVisibleCanvasFromOffscreen(primroseObj) {
    return new Promise((resolve) => {
      const offscreenCanvas = primroseObj.canvas;
      const visibleCanvas = document.createElement("canvas");
      visibleCanvas.width = offscreenCanvas.width;
      visibleCanvas.height = offscreenCanvas.height;
  
      primroseObj.addEventListener("update", () => {
        const ctx = visibleCanvas.getContext("2d");
        ctx.drawImage(offscreenCanvas, 0, 0);
        resolve(visibleCanvas);
      });
    });
  }
  function setLoadingOverlayVisible(visible) {
    const loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.style.display = visible ? "flex" : "none";
  }

    ThreeMaze.prototype.onGenerateMaze = function()
    {
        retrieveMaze(this).then(() => {
        var new_map = this.new_map;

        var new_player_path = [];
        var latency = 50;
        var self = this;
        var tween = null;
        for (var x = this.side; x > 0; x -= 1)
        {
            new_player_path[x] = [];
            for (var y = 1; y < this.side + 1; y += 1)
            {
                var delay = ((this.side - x) * latency) + ((this.side - y) * latency);
                // Inits player path
                new_player_path[x][y] = false;

                // Removes old mesh if needed
                if (typeof this.map[x] != 'undefined' && typeof this.map[x][y] != 'undefined' && typeof this.map[x][y] === 'object')
                {
                    tween = new TWEEN.Tween({scale: 1, y: this.thickness / 2, mesh: this.map[x][y]}).to({scale: 0, y: 0}, 200).delay(delay);
                    tween.onUpdate(this.onUpdateTweeningMesh);
                    tween.onComplete(function()
                    {
                        this.mesh.visible = false;
                        self.scene.remove(this.mesh);
                    });
                    tween.start();
                }

                // Removes player path if needed
                if (typeof this.player.path != 'undefined' && typeof this.player.path[x] != 'undefined' && typeof this.player.path[x][y] != 'undefined' && typeof this.player.path[x][y] === 'object')
                {
                    this.removePlayerPath(x, y, delay);
                }

                // Adds a new mesh if needed
                if (new_map[x][y] === 0)
                {
                    // Generates the mesh
                    var wall_geometry = new THREE.CubeGeometry(this.thickness, this.thickness, this.thickness, 1, 1, 1);
                    new_map[x][y] = new THREE.Mesh(wall_geometry, this.materials.grey);
                    new_map[x][y].visible = false;
                    new_map[x][y].position.set(x * this.thickness - ((this.side * this.thickness) / 2), 0, y * 20 - ((this.side * this.thickness) / 2));
                    this.scene.add(new_map[x][y]);

                    // Builds the related tween
                    tween = new TWEEN.Tween({scale: 0, y: 0, mesh: new_map[x][y]}).to({scale: 1, y: this.thickness / 2}, 300).delay(delay);
                    tween.onUpdate(this.onUpdateTweeningMesh);
                    tween.onStart(function()
                    {
                        this.mesh.visible = true;
                    });
                    tween.start();
                }
                else
                {
                    new_map[x][y] = false;
                }
            }
        }
// Animates the end block
const end_hide_tween = new TWEEN.Tween({ scale: 1, y: this.thickness / 2, mesh: this.end })
  .to({ scale: 0, y: 0 }, 300);
const end_show_tween = new TWEEN.Tween({ scale: 0, y: 0, mesh: this.end })
  .to({ scale: 1, y: this.thickness / 2 }, 300)
  .delay((this.side * 2) * latency);
end_hide_tween.onUpdate(this.onUpdateTweeningMesh.bind(this));
end_show_tween.onUpdate(this.onUpdateTweeningMesh.bind(this));
end_show_tween.onStart(function () {
  this.mesh.visible = true;
});
end_hide_tween.onComplete(function () {
  this.mesh.visible = false;
});
if (this.end.scale.y !== 0) {
  end_hide_tween.start();
}
end_show_tween.start();

this.map = new_map;
this.player.path = new_player_path;

// Inits player
this.player.mazePosition = { x: this.side - 1, z: this.side - 1 };
this.movePlayer(false);

// Updates a mesh when doing a tween
ThreeMaze.prototype.onUpdateTweeningMesh = function (obj) {
  obj.mesh.scale.y = obj.scale;
  obj.mesh.position.y = obj.y;
};

// Removes a mesh from the player path
ThreeMaze.prototype.removePlayerPath = function (x, y, delay) {
  const tween = new TWEEN.Tween({ scale: 1, y: this.thickness / 8, mesh: this.player.path[x][y] })
    .to({ scale: 0, y: this.thickness * 5 }, 300)
    .delay(delay);
  const self = this;
  this.player.path[x][y] = false;
  tween.onUpdate(function (obj) {
    obj.mesh.scale.set(obj.scale, obj.scale, obj.scale);
    obj.mesh.position.y = obj.y;
  });
  tween.onComplete(function (obj) {
    self.scene.remove(obj.mesh);
  });
  tween.onStart(function (obj) {
    obj.mesh.visible = true;
  });
  tween.start();
};

// Inits the scene
ThreeMaze.prototype.initScene = function () {
  // Scene
  this.scene = new THREE.Scene();

  // Materials
  this.materials = {
    grey: new THREE.MeshLambertMaterial({ color: 0xffffff }),
    red: new THREE.MeshLambertMaterial({ color: 0xf18260 })
  };

  // Camera
  this.camera = new THREE.PerspectiveCamera(45, 1, 1, 2000);
  this.camera.clicked = false;

  // Lights
  this.scene.add(new THREE.AmbientLight(0xc9c9c9));
  const directional = new THREE.DirectionalLight(0xc9c9c9, 0.5);
  directional.position.set(0, 0.5, 1);
  this.scene.add(directional);

  // Player
  this.player = new THREE.Object3D();
  const head_mesh = new THREE.Mesh(new THREE.SphereGeometry(this.thickness / 2, 9, 9), this.materials.red);
  const body_mesh = new THREE.Mesh(new THREE.CylinderGeometry(this.thickness / 6, this.thickness / 2, this.thickness * 1.5, 12, 1), this.materials.red);
  this.player.add(head_mesh);
  this.player.add(body_mesh);
// Animates the end block
const endHideTween = new TWEEN.Tween({scale: 1, y: this.thickness / 2, mesh: this.end}).to({scale: 0, y: 0}, 300);
const endShowTween = new TWEEN.Tween({scale: 0, y: 0, mesh: this.end}).to({
    scale: 1,
    y: this.thickness / 2
}, 300).delay((this.side * 2) * latency);
endHideTween.onUpdate(this.onUpdateTweeningMesh);
endShowTween.onUpdate(this.onUpdateTweeningMesh);
endShowTween.onStart(function()
{
    this.mesh.visible = true;
});
endHideTween.onComplete(function()
{
    this.mesh.visible = false;
});
if (this.end.scale.y != 0)
{
    endHideTween.start();
}
endShowTween.start();

this.map = new_map;
this.player.path = new_player_path;

// Inits player
this.player.mazePosition = {x: this.side - 1, z: this.side - 1};
this.movePlayer(false);
});

};

/**
 * Updates a mesh when doing a tween
 */
ThreeMaze.prototype.onUpdateTweeningMesh = function()
{
    this.mesh.scale.y = this.scale;
    this.mesh.position.y = this.y;
};

/**
 * Removes a mesh from the player path
 * @param x
 * @param y
 * @param delay
 */
ThreeMaze.prototype.removePlayerPath = function(x, y, delay)
{
    const tween = new TWEEN.Tween({scale: 1, y: this.thickness / 8, mesh: this.player.path[x][y]}).to({
        scale: 0,
        y: this.thickness * 5
    }, 300).delay(delay);
    const self = this;
    this.player.path[x][y] = false;
    tween.onUpdate(function()
    {
        this.mesh.scale.set(this.scale, this.scale, this.scale);
        this.mesh.position.y = this.y;
    });
    tween.onComplete(function()
    {
        self.scene.remove(this.mesh);
    });
    tween.onStart(function()
    {
        this.mesh.visible = true;
    });
    tween.start();
};

/**
 * Inits the scene
 */
ThreeMaze.prototype.initScene = function()
{
    // Scene
    this.scene = new THREE.Scene();

    // Materials
    this.materials =
    {
        grey: new THREE.MeshLambertMaterial({color: 0xffffff}),
        red: new THREE.MeshLambertMaterial({color: 0xf18260})
    };

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 2000);
    this.camera.clicked = false;

    // Lights
    this.scene.add(new THREE.AmbientLight(0xc9c9c9));
    const directional = new THREE.DirectionalLight(0xc9c9c9, 0.5);
    directional.position.set(0, 0.5, 1);
    this.scene.add(directional);

    // Player
    this.player = new THREE.Object3D();
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(this.thickness / 2, 9, 9), this.materials.red);
    const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(this.thickness / 6, this.thickness / 2, this.thickness * 1.5, 12, 1), this.materials.red);
    this.player.add(headMesh);
    this.player.add(bodyMesh);
headMesh.position.y = this.thickness * 1.5;
bodyMesh.position.y = this.thickness / 2;
this.scene.add(this.player);

// Renderer
this.renderer = new THREE.WebGLRenderer({antialias: true});
this.renderer.setClearColor(0xf0f0f0);
this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
this.container.appendChild(this.renderer.domElement);

// Controls
this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
this.controls.enableKeys = false;
this.controls.addEventListener('change', this.animate.bind(this));

// Events
window.addEventListener('resize', this.onWindowResize.bind(this), false);
this.container.addEventListener('mousedown', this.onMouseDown.bind(this), false);
this.container.addEventListener('mouseup', this.onMouseUp.bind(this), false);
};

/**

Handles window resizing
*/
ThreeMaze.prototype.onWindowResize = function()
{
this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
this.camera.updateProjectionMatrix();
this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
};
/**

Handles mouse down event
@param event
*/
ThreeMaze.prototype.onMouseDown = function(event)
{
this.camera.clicked = true;
};
/**

Handles mouse up event
@param event
*/
ThreeMaze.prototype.onMouseUp = function(event)
{
if (this.camera.clicked)
{
this.movePlayer(true);
this.camera.clicked = false;
}
};
/**

Renders the scene
*/
ThreeMaze.prototype.render = function()
{
this.renderer.render(this.scene, this.camera);
};
/**

Animates the scene
*/
ThreeMaze.prototype.animate = function()
{
requestAnimationFrame(this.animate.bind(this));
TWEEN.update();
this.controls.update();
this.render();
};


  
