window.addEventListener('load', () => {
  const canvas = document.getElementById('background-canvas');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  const shapes = [];
  const geometries = [
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.SphereGeometry(0.4, 16, 16),
    new THREE.TorusKnotGeometry(0.3, 0.1, 100, 16)
  ];

  const colors = [0x805ad5, 0x667eea, 0x4fd1c5, 0x48bb78];

  for (let i = 0; i < 20; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const material = new THREE.MeshPhongMaterial({ color, flatShading: true });

    const shape = new THREE.Mesh(geometry, material);
    shape.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );
    shape.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    scene.add(shape);
    shapes.push(shape);
  }

  function animate() {
    requestAnimationFrame(animate);
    shapes.forEach(shape => {
      shape.rotation.x += 0.005;
      shape.rotation.y += 0.005;
    });
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
});
