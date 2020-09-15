import React, { useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from 'react-three-fiber'
import { Text, Box, useMatcapTexture, Octahedron } from 'drei'

import { ThinFilmFresnelMap } from './ThinFilmFresnelMap'
import { mirrorsData, textData } from "./data"

const FONT = "https://fonts.gstatic.com/s/raleway/v17/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVtzpbCIPrcVIT9d0c8.woff"

function ResponsiveText(props) {
  const ref = useRef()
  const { viewport } = useThree() 

  useFrame(({ mouse }) => {
    const x = (mouse.x * viewport.width) / 30
    const y = (mouse.y * viewport.height) / 30
    
    ref.current.position.set(
      props.position[0] + x,
      props.position[1] + y,
      props.position[2]
    )

    ref.current.rotation.set(
      props.rotation[0] - y,
      props.rotation[1] + x,
      props.rotation[2]
    )
  })

  return (
    <group ref={ref} {...props}>
      <Text position={[-1.8, 0.4, 0]} fontSize={3.8} font={FONT} >R</Text>
      <Text position={[0, -0.6, 0]} rotation={[0, 0, -Math.PI/16]} fontSize={3.8} font={FONT} >3</Text>
      <Text position={[1.5, 0.2, 0]} scale={[-1, 1, 1]} fontSize={3.8} font={FONT} >F</Text>
    </group>
  )
}

function Mirror({ material, texture, args, map, ...props }) {
  const ref = useRef()

  useFrame(() => void (ref.current.rotation.y += 0.01))

  
  return (
    <group {...props}>
      <Box ref={ref} args={args} >
        <meshLambertMaterial attachArray="material" map={map} color={0xaaaaaa} />
        <meshLambertMaterial attachArray="material" map={map} color={0xaaaaaa} />
        <meshLambertMaterial attachArray="material" map={map} color={0xaaaaaa} />
        <meshLambertMaterial attachArray="material" map={map} color={0xaaaaaa} />
        <meshLambertMaterial attachArray="material" envMap={texture} map={map}/>
        <meshLambertMaterial attachArray="material" envMap={texture} map={map}/>
      </Box>
    </group>
  )
}

export default function Scene() {
  const [cubeRenderTarget] = useState(new THREE.WebGLCubeRenderTarget(1024, { format: THREE.RGBAFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter }))
  const [thinFilmFresnelMap] = useState(new ThinFilmFresnelMap())

  const camera = useRef()
  const sphere = useRef()

  const [matcapTexture] = useMatcapTexture("C8D1DC_575B62_818892_6E747B")
  
  useFrame(({ gl, scene }) => {
    sphere.current.visible = true
    camera.current.update(gl, scene)
    sphere.current.visible = false
  })



  return (
    <>
      <cubeCamera ref={camera} args={[0.1, 100, cubeRenderTarget]} position={[0, 0, 5]} />
      <group>
        {mirrorsData.mirrors.map((mirror, index) => (
          <Mirror key={`0${index}`} {...mirror} texture={cubeRenderTarget.texture} map={thinFilmFresnelMap} />
        ))}
      </group>
      <group position={[0, 0, 5]}>
        {textData.map((data, index) => <ResponsiveText key={`0${index}`} {...data}/>)}
      </group>
      <Octahedron ref={sphere} args={[20, 4, 4]} position={[0, 0, -5]} >
        <meshMatcapMaterial matcap={matcapTexture} side={THREE.BackSide} transparent opacity={0.3} color=""/>
      </Octahedron>
    </>
  )
}
