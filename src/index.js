import { render } from 'react-dom'
import React, { Suspense } from 'react'
import { Canvas } from 'react-three-fiber'
import * as THREE from 'three'

import Scene from './Scene'

function App() {

  return (
    <Canvas
      camera={{ fov: 70 }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color("#000000").convertGammaToLinear()
      }}
      >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <ambientLight intensity={1} />
    </Canvas>
  )
}

render(<App />, document.querySelector('#root'))
