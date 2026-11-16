// Nur die Teile von Three.js, die das Arbeitszimmer braucht.
// So kann der Bundler den Rest der Bibliothek weglassen.
export {
  ACESFilmicToneMapping, AmbientLight, BoxGeometry, CanvasTexture, CapsuleGeometry, CatmullRomCurve3,
  CircleGeometry, Clock, Color, CylinderGeometry, DirectionalLight, DoubleSide, ExtrudeGeometry, Fog,
  Group, HemisphereLight, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshLambertMaterial,
  NearestFilter, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, Raycaster,
  SRGBColorSpace, Scene, Shape, SphereGeometry, TextureLoader, TorusGeometry, TubeGeometry,
  Vector2, Vector3, WebGLRenderer,
} from 'three';
