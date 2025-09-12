window.addEventListener('load', () => {
  const canvas = document.getElementById('bg');
  if (!canvas || !window.THREE) return;

  // === Setup ===
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a0a, 10, 30); // Dark fog

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 15;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(scene.fog.color); // Match fog

  // === Lighting ===
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.7);
  directional.position.set(5, 10, 7.5);
  scene.add(directional);

  // === Prism Geometry and Material ===
  const prismGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 6);
  const prismMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x000000
  });

  // === Generate Prisms ===
  const prisms = [];
  const COUNT = 20;

  for (let i = 0; i < COUNT; i++) {
    const prism = new THREE.Mesh(prismGeometry, prismMaterial.clone());

    prism.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 25
    );

    prism.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    prism.userData = {
      drift: new THREE.Vector3(
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.002
      ),
      rotationSpeed: new THREE.Vector3(
        Math.random() * 0.001,
        Math.random() * 0.001,
        Math.random() * 0.001
      )
    };

    scene.add(prism);
    prisms.push(prism);
  }

  // === Animate ===
  function animate() {
    requestAnimationFrame(animate);

    for (let prism of prisms) {
      prism.position.add(prism.userData.drift);
      prism.rotation.x += prism.userData.rotationSpeed.x;
      prism.rotation.y += prism.userData.rotationSpeed.y;
      prism.rotation.z += prism.userData.rotationSpeed.z;

      // Wrap if out of bounds
      if (prism.position.length() > 30) {
        prism.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10,
          -20
        );
      }
    }

    renderer.render(scene, camera);
  }

  // === Resize ===
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
});
