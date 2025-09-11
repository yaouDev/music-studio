(() => {
  if (!window.THREE) {
    console.error('Three.js is required');
    return;
  }

  // Setup renderer & canvas
  const canvas = document.getElementById('bg') || (() => {
    const c = document.createElement('canvas');
    c.id = 'bg';
    document.body.appendChild(c);
    return c;
  })();

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 6);

  // Controls vars for smooth mouse parallax
  let mouseX = 0, mouseY = 0;
  let targetCamX = 0, targetCamY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // Lighting setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1.2);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  // Load HDR environment map (using low-res equirectangular from CDN)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const rgbeLoader = new THREE.RGBELoader();
  rgbeLoader.setDataType(THREE.UnsignedByteType);

  let envMap = null;

  rgbeLoader.load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/equirectangular/royal_esplanade_1k.hdr',
    (texture) => {
      envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      texture.dispose();
      pmremGenerator.dispose();
      initPrisms();
    },
    undefined,
    (err) => {
      console.error('Error loading HDR:', err);
      initPrisms(); // fallback if HDR fails
    }
  );

  // Prism parameters
  const PRISM_COUNT = 7;
  const prisms = [];

  // Prism geometry (hexagonal prism)
  function createPrismGeometry(height = 1.5, radius = 0.4) {
    const shape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: height,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(Math.PI / 2);
    geometry.center();
    return geometry;
  }

  // Prism shader material — PBR + anisotropic shimmer
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPos;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      vViewDir = normalize(cameraPosition - vWorldPos);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform samplerCube envMap;
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPos;

    // Fresnel effect helper
    float fresnel(vec3 I, vec3 N, float bias, float scale, float power) {
      return bias + scale * pow(1.0 + dot(I, N), power);
    }

    // Anisotropic highlight (simple model)
    float anisotropicHighlight(vec3 N, vec3 V, vec3 L, float anisotropy) {
      vec3 H = normalize(L + V);
      float dotNH = dot(N, H);
      float dotVH = dot(V, H);
      return pow(dotNH * dotVH, anisotropy);
    }

    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewDir);

      // Environment reflection vector
      vec3 R = reflect(-V, N);

      // Sample environment map for reflection
      vec3 envColor = textureCube(envMap, R).rgb;

      // Basic color tint
      vec3 baseColor = vec3(0.07, 0.07, 0.07);

      // Fresnel effect
      float fresnelFactor = fresnel(V, N, 0.1, 0.9, 5.0);

      // Anisotropic shimmer direction oscillates over time
      float anisotropy = 12.0;
      float shimmer = anisotropicHighlight(N, V, normalize(vec3(sin(time), cos(time), 0.5)), anisotropy);

      // Composite final color
      vec3 color = baseColor * 0.3 + envColor * 0.7 * fresnelFactor + shimmer * 0.6;

      // Add a slight emission/glow on shimmer
      vec3 emission = vec3(0.3, 0.35, 0.4) * shimmer;

      gl_FragColor = vec4(color + emission, 1.0);
    }
  `;

  let prismMaterial;

  function initPrisms() {
    if (!envMap) {
      // fallback environment - simple color
      scene.background = new THREE.Color(0x080808);
    }

    prismMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        envMap: { value: envMap },
        time: { value: 0 },
      },
      side: THREE.DoubleSide,
      transparent: false,
    });

    // Create prisms and add to scene
    for (let i = 0; i < PRISM_COUNT; i++) {
      const geo = createPrismGeometry();

      const mesh = new THREE.Mesh(geo, prismMaterial.clone());

      // Random position within a spread volume
      mesh.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 2 + 1,
        (Math.random() - 0.5) * 4
      );

      // Store velocity and rotation data
      mesh.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.005
      );
      mesh.userData.rotationSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.002
      );

      prisms.push(mesh);
      scene.add(mesh);
    }

    // Initialize fog particles after prisms ready
    initFogParticles();
  }

  // --- Fog Particles (volumetric mist) ---
  let fogParticles;
  const FOG_PARTICLE_COUNT = 150;
  const fogPositions = new Float32Array(FOG_PARTICLE_COUNT * 3);

  function initFogParticles() {
    for (let i = 0; i < FOG_PARTICLE_COUNT; i++) {
      fogPositions[i * 3] = (Math.random() - 0.5) * 20;
      fogPositions[i * 3 + 1] = Math.random() * 3;
      fogPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(fogPositions, 3));

    const fogMaterial = new THREE.PointsMaterial({
      color: 0x99aabb,
      size: 0.15,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    fogParticles = new THREE.Points(geometry, fogMaterial);
    scene.add(fogParticles);
  }

  // --- Boids style collision avoidance ---

  const maxSpeed = 0.01;
  const maxForce = 0.00005;
  const desiredSeparation = 0.7;

  function separation(prism, others) {
    let steer = new THREE.Vector3();
    let count = 0;

    others.forEach(other => {
      if (other === prism) return;

      const diff = new THREE.Vector3().subVectors(prism.position, other.position);
      const dist = diff.length();

      if (dist > 0 && dist < desiredSeparation) {
        diff.normalize();
        diff.divideScalar(dist);
        steer.add(diff);
        count++;
      }
    });

    if (count > 0) {
      steer.divideScalar(count);
    }

    if (steer.length() > 0) {
      steer.normalize();
      steer.multiplyScalar(maxSpeed);
      steer.sub(prism.userData.velocity);
      steer.clampLength(0, maxForce);
    }

    return steer;
  }

  // Animation Loop

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Smooth camera parallax (lerp to mouse)
    targetCamX += (mouseX * 0.8 - targetCamX) * 0.05;
    targetCamY += (mouseY * 0.3 - targetCamY) * 0.05;

    camera.position.x = targetCamX * 2;
    camera.position.y = 1.5 + targetCamY * 1.2;
    camera.lookAt(0, 1, 0);

    // Update prisms movement & rotation
    prisms.forEach(prism => {
      // Apply collision avoidance steering
      const avoid = separation(prism, prisms);
      prism.userData.velocity.add(avoid);

      // Clamp velocity
      prism.userData.velocity.clampLength(0, maxSpeed);

      // Update position
      prism.position.add(prism.userData.velocity);

      // Rotate prisms slowly
      prism.rotation.x += prism.userData.rotationSpeed.x;
      prism.rotation.y += prism.userData.rotationSpeed.y;
      prism.rotation.z += prism.userData.rotationSpeed.z;

      // Wrap around bounds for infinite looping effect
      const bounds = 4;
      ['x', 'y', 'z'].forEach(axis => {
        if (prism.position[axis] > bounds) prism.position[axis] = -bounds;
        if (prism.position[axis] < -bounds) prism.position[axis] = bounds;
      });
    });

    // Animate fog particles drifting upward and wrap
    const fogPositions = fogParticles.geometry.attributes.position.array;
    for (let i = 0; i < FOG_PARTICLE_COUNT; i++) {
      fogPositions[i * 3 + 1] += 0.0006;
      if (fogPositions[i * 3 + 1] > 4) {
        fogPositions[i * 3] = (Math.random() - 0.5) * 20;
        fogPositions[i * 3 + 1] = 0;
        fogPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
    }
    fogParticles.geometry.attributes.position.needsUpdate = true;

    // Update shader time uniform
    prisms.forEach(p => p.material.uniforms.time.value = elapsed);

    renderer.render(scene, camera);
  }

  // Resize handler
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Kickstart animation after prisms are ready
  // initPrisms will be called after env map loads or fallback

})();
