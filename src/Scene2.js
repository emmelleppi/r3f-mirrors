import React, { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from 'react-three-fiber'
import { Text, Box, useMatcapTexture, Octahedron, useGLTFLoader } from 'drei'

import { ThinFilmFresnelMap } from './ThinFilmFresnelMap'
import { mirrorsData, textData } from "./data"

const FONT = "http://fonts.gstatic.com/s/monoton/v10/5h1aiZUrOngCibe4TkHLRA.woff"

function ResponsiveText({ material, texture, map, ...props }) {
  const { viewport } = useThree()

  return (
    <group {...props}>
      <Text maxWidth={viewport.width} textAlign="center" position={[0, -1, 0]} fontSize={5} font={FONT} anchorX="center"
      anchorY="middle" >
        OLGA
        <meshPhysicalMaterial envMap={texture} map={map} roughness={0} metalness={1} />
      </Text>
    </group>
  )
}

function Diamond({ map, texture, ...props }) {
  const group = useRef()
  const [matcapTexture] = useMatcapTexture("2E763A_78A0B7_B3D1CF_14F209")

  const { nodes } = useGLTFLoader('/diamond.glb')

  useFrame(() => {
    group.current.rotation.y += 0.001
    group.current.rotation.z += 0.01
  })

  return (
    <group ref={group} {...props} dispose={null} >
      <mesh geometry={nodes.Cylinder.geometry} >
        <meshMatcapMaterial matcap={matcapTexture} transparent opacity={0.9}/>
      </mesh>
    </group>
  )
}

export default function Scene() {
  const [cubeRenderTarget] = useState(
    new THREE.WebGLCubeRenderTarget(1024, { format: THREE.RGBAFormat, generateMipmaps: true, minFilter: THREE.LinearFilter })
  )
  const [thinFilmFresnelMap] = useState(new ThinFilmFresnelMap(410, 0, 5, 1024))

  const camera = useRef()
  const text = useRef()
  const group = useRef()

  const [matcapTexture] = useMatcapTexture("BA5DBA_F2BEF2_E69BE6_DC8CDC")
  
  const { viewport } = useThree()

  const [posV, rotE, rotQ] = useMemo(() => {
    return [
      new THREE.Vector3(0, 0, 0), 
      new THREE.Euler(0,0,0), 
      new THREE.Quaternion(0, 0, 0, 0)
    ]
  }, [])
  
  useFrame(({ mouse, gl, scene }) => {
    const x = (mouse.x * viewport.width) / 100
    const y = (mouse.y * viewport.height) / 100

    posV.set(x,y,0)
    rotE.set(y,x,0)

    rotQ.setFromEuler(rotE)

    group.current.position.lerp(posV, 0.1)
    group.current.quaternion.slerp(rotQ, 0.1)

    text.current.visible = false
    camera.current.update(gl, scene)
    text.current.visible = true
  })

  return (
    <group ref={group}>
      <group name="mirrors">
        {mirrorsData.mirrors.map((mirror, index) => (
          <Diamond key={`0${index}`} {...mirror} scale={[0.5, 0.5, 0.5]} />
        ))}
      </group>
      <cubeCamera ref={camera} args={[0.001, 100, cubeRenderTarget]} position={[0, 0, -12]} />
      <group ref={text} name="text" position={[0, 0, -5]}>
        <ResponsiveText texture={cubeRenderTarget.texture} map={thinFilmFresnelMap} />
      </group>
      <Octahedron args={[20, 4, 4]} position={[0, 0, -5]} >
        <meshMatcapMaterial matcap={matcapTexture} side={THREE.BackSide} />
      </Octahedron>
    </group>
  )
}
