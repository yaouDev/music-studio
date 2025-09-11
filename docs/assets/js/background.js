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
  camera.position.z = 7;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Ambient and subtle red glow
  const ambientLight = new THREE.AmbientLight(0x222222, 0.8);
  scene.add(ambientLight);

  // Red accent point lights, softly glowing
  const redLight1 = new THREE.PointLight(0xE63946, 1, 10);
  redLight1.position.set(3, 3, 3);
  scene.add(redLight1);

  const redLight2 = new THREE.PointLight(0xE63946, 0.5, 15);
  redLight2.position.set(-4, -2, 2);
  scene.add(redLight2);

  const shapes = [];
  const geometries = [
    new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16),
    new THREE.SphereGeometry(0.6, 32, 32)
  ];

  const colors = [0x0D0D0D, 0x1A1A1A, 0x333333, 0x4A4A4A]; // Dark greys and black

  for (let i = 0; i < 15; i++) {
    const geometry = geometries[i % geometries.length];
    const color = colors[i % colors.length];
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.7,
      metalness: 0.3,
      emissive: 0x000000,
      flatShading: false,
    });

    const shape = new THREE.Mesh(geometry, material);
    shape.position.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6
    );
    shape.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    scene.add(shape);
    shapes.push(shape);
  }

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    let elapsed = clock.getElapsedTime();

    shapes.forEach((shape, i) => {
      // Slow rotations with oscillations
      shape.rotation.x += 0.002 + 0.001 * Math.sin(elapsed + i);
      shape.rotation.y += 0.003 + 0.0015 * Math.cos(elapsed + i * 1.1);

      // Slight pulsating scale for subtle breathing effect
      const scale = 1 + 0.05 * Math.sin(elapsed * 2 + i);
      shape.scale.set(scale, scale, scale);
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
