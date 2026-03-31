import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Hero3D() {
  const canvasRef = useRef(null)
  const init = useRef(false)

  useEffect(() => {
    if (init.current || !canvasRef.current) return
    init.current = true
    const canvas = canvasRef.current
    const W = Math.min(430, window.innerWidth * 0.42)
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setSize(W, W)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    cam.position.z = 3.8

    const outer = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.5, 4)),
      new THREE.LineBasicMaterial({ color: 0x7b2fff, transparent: true, opacity: 0.28 })
    )
    scene.add(outer)

    const inner = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.0, 2)),
      new THREE.LineBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.5 })
    )
    scene.add(inner)

    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x07070f })
    ))

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.62, 1.66, 80),
      new THREE.MeshBasicMaterial({ color: 0xff4d6d, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
    )
    ring.rotation.x = Math.PI * 0.3
    scene.add(ring)

    const pa = []
    for (let i = 0; i < 260; i++) {
      const ph = Math.acos(2 * Math.random() - 1)
      const th = 2 * Math.PI * Math.random()
      const r = 1.9 + Math.random() * 0.7
      pa.push(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph))
    }
    const pg2 = new THREE.BufferGeometry()
    pg2.setAttribute('position', new THREE.Float32BufferAttribute(pa, 3))
    scene.add(new THREE.Points(pg2, new THREE.PointsMaterial({ color: 0xd4ff00, size: 0.02, transparent: true, opacity: 0.72 })))

    let t = 0, raf
    const animate = () => {
      raf = requestAnimationFrame(animate)
      t += 0.005
      outer.rotation.y = t * 0.35
      outer.rotation.x = t * 0.12
      inner.rotation.y = -t * 0.5
      inner.rotation.x = t * 0.2
      ring.rotation.z = t * 0.25
      renderer.render(scene, cam)
    }
    animate()
    return () => { cancelAnimationFrame(raf); renderer.dispose() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="float1"
      style={{ width: Math.min(430, window.innerWidth * 0.42), height: Math.min(430, window.innerWidth * 0.42) }}
    />
  )
}
