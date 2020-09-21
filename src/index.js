import { render } from 'react-dom'
import React, { Suspense } from 'react'
import { Canvas } from 'react-three-fiber'
import * as THREE from 'three'

import Scene from './Scene'
import Scene2 from './Scene2'
import Scene3 from './Scene3'

function App() {
  return (
    <Canvas concurrent shadowMap camera={{ position: [0, 0, 2], fov: 70 }}>
      <color attach="background" args={["#000"]} />
      <Suspense fallback={null}>
        {/* <Scene /> */}
        {/* <Scene2 /> */}
        <Scene3 />
      </Suspense>
      <ambientLight intensity={0.4} />
    </Canvas>
  )
}

render(<App />, document.querySelector('#root'))
