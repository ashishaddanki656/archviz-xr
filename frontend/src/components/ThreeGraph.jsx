import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeGraph({ data }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!data || !data.nodes || data.nodes.length === 0) return;

    const width = mountRef.current.clientWidth;
    const height = 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f1a);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(0x7c6ff7, 2, 20);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    const nodeMap = {};
    data.nodes.forEach((node) => {
      const geo = new THREE.SphereGeometry(0.18, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x7c6ff7,
        emissive: 0x3a3080,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(node.x * 1.5, node.y * 1.5, node.z * 1.5);
      scene.add(mesh);
      nodeMap[node.id] = mesh.position.clone();

      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.font = "24px Arial";
      ctx.fillText(node.label, 8, 44);
      const tex = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.2, 0.3, 1);
      sprite.position.set(node.x * 1.5, node.y * 1.5 + 0.35, node.z * 1.5);
      scene.add(sprite);
    });

    data.edges.forEach((edge) => {
      const from = nodeMap[edge.from];
      const to = nodeMap[edge.to];
      if (!from || !to) return;
      const points = [from.clone(), to.clone()];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: 0x4a4a8a });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
    });

    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      scene.rotation.y += dx * 0.01;
      rotY = scene.rotation.y;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        rotY += 0.005;
        scene.rotation.y = rotY;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      if (
        mountRef.current &&
        renderer.domElement.parentNode === mountRef.current
      ) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [data]);

  return (
    <div
      style={{
        margin: "2rem 0",
        background: "#13131f",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "1rem 1.5rem 0.5rem" }}>
        <h2 style={{ color: "#7c6ff7" }}>3D Knowledge Graph</h2>
        <p style={{ color: "#666", fontSize: "0.85rem" }}>Drag to rotate</p>
      </div>
      <div ref={mountRef} style={{ width: "100%", height: "400px" }} />
    </div>
  );
}
