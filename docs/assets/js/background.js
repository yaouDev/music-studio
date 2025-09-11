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

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Create a gradient background with dark colors
  const gradientTexture = new THREE.TextureLoader().load(
    'https://cdn.pixabay.com/photo/2017/12/20/18/59/gradient-3039837_960_720.png'
  );
  const bgMaterial = new THREE.MeshBasicMaterial({ map: gradientTexture });
  const bgGeometry = new THREE.PlaneGeometry(20, 20);
  const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
  bgMesh.position.z = -10;
  scene.add(bgMesh);

  // Particle system parameters
  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);
  const phases = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    // Start particles randomly spread in a box volume
    positions[i * 3] = (Math.random() - 0.5) * 10;      // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6;   // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;   // z

    speeds[i] = 0.001 + Math.random() * 0.002;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Use a subtle glowing red texture for particles
  const sprite = new THREE.TextureLoader().load(
    'https://threejs.org/examples/textures/sprites/circle.png'
  );

  const material = new THREE.PointsMaterial({
    size: 0.08,
    map: sprite,
    transparent: true,
    opacity: 0.7,
    color: 0xE63946,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    const positions = geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
      // Organic drifting movement: particles gently move up and sway sideways
      positions[i * 3 + 1] += speeds[i];  // drift upward
      positions[i * 3] += 0.002 * Math.sin(time + phases[i]);  // sway left/right

      // Reset particles that move too far up to bottom to loop infinitely
      if (positions[i * 3 + 1] > 3) {
        positions[i * 3 + 1] = -3;
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
    }

    geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
});
