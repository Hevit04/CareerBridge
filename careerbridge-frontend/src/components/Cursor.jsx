import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const mouse = useRef({ x: 0, y: 0 })
  const follower = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px'
        dotRef.current.style.top = e.clientY + 'px'
      }
    }
    document.addEventListener('mousemove', onMove)

    const loop = () => {
      follower.current.x += (mouse.current.x - follower.current.x) * 0.11
      follower.current.y += (mouse.current.y - follower.current.y) * 0.11
      if (ringRef.current) {
        ringRef.current.style.left = follower.current.x + 'px'
        ringRef.current.style.top = follower.current.y + 'px'
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      <div id="cur" ref={dotRef} />
      <div id="cur2" ref={ringRef} />
    </>
  )
}
