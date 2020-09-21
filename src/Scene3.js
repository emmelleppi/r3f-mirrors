import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, useResource } from 'react-three-fiber'
import { Text, Box, useMatcapTexture, Octahedron, OrbitControls, Plane } from 'drei'
import { Physics, useBox, usePlane } from "use-cannon"

import { ThinFilmFresnelMap } from './ThinFilmFresnelMap'

const textProps = {
  fontSize: 3.5,
  font: 'http://fonts.gstatic.com/s/ericaone/v11/WBLnrEXccV9VGrOKmGDFXEXL.woff'
}

function Title({ layers = undefined, label = "", color, ...props}) {
  
  const group = useRef()
  useEffect(() => void group.current.lookAt(0, 0, 0), [])
  
  return (
    <group {...props} ref={group}>
      <Text castShadow name={label} depthTest={false} material-toneMapped={false} {...textProps} layers={layers}>
        {label}
        {color && <meshStandardMaterial color={color} />}
      </Text>
    </group>
  )
}

function PhyPlane(props) {
  const [ref] = usePlane(() => ({
    ...props
  }))
  usePlane(() => ({ position: [0, 0, -15]}))
  return (
    <>
      <Plane args={[1000, 1000]} ref={ref} receiveShadow ><meshStandardMaterial color="#fff" /></Plane>
      <Plane args={[1000, 1000]} {...props} layers={[11]}><meshBasicMaterial color="#fff" /></Plane>
    </>
  )
}

function Mirror({ envMap, fresnel, ...props }) {
  const [ref, api] = useBox(() => props)
  return (
    <Box ref={ref} args={props.args} onClick={() => api.applyImpulse([0, 0, -50], [0, 0, 0])} receiveShadow castShadow>
      <meshPhysicalMaterial envMap={envMap} map={fresnel} roughness={0} metalness={1} />
    </Box>
  )
}

function Mirrors({ envMap }) {
  const mirrorsData = useMemo(() => new Array(5 * 6).fill().map((_, index) => ({
    mass: 1,
    material: { friction: 1, restitution: 0 },
    args: [2, 2, 2],
    position: [-5 + (index * 2) % 12, -1 + 2 * Math.floor((index * 2) / 12), -3],
    fresnel: new ThinFilmFresnelMap(500 - Math.round(Math.random() * 50), 0, Math.round(Math.random() * 5), 1024)
  })), [])

  return (
    <group name="mirrors">
      {mirrorsData.map((mirror, index) => (
        <Mirror
          key={`0${index}`} 
          name={`mirror-${index}`}
          {...mirror} 
          envMap={envMap}
        />
      ))}
    </group>
  )

}

function TitleCopies({ layers, label, ...props }) {
  const vertices = useMemo(() => {
    const y = new THREE.CircleGeometry(10, 4, 4)
    return y.vertices
  }, [])

  return <group name="titleCopies" {...props} >{vertices.map((vertex,i) => <Title name={"titleCopy-" + i} label={label} position={vertex} layers={layers} />)}</group>
}

export default function Scene() {
  const [renderTarget] = useState(
    new THREE.WebGLCubeRenderTarget(1024, { format: THREE.RGBAFormat, generateMipmaps: true, minFilter: THREE.LinearFilter })
  )

  const camera = useRef()
  const [matcapTexture] = useMatcapTexture('7877EE_D87FC5_75D9C7_1C78C0')
  
  useFrame(({ gl, scene }) => {
    camera.current.update(gl, scene)
  })

  const group = useRef()
  
  const { viewport } = useThree()

  const [rotationEuler, rotationQuaternion] = useMemo(() => {
    return [
      new THREE.Euler(0, 0, 0), 
      new THREE.Quaternion(0, 0, 0, 0)
    ]
  }, [])
  
  useFrame(({ mouse }) => {
    const x = (mouse.x * viewport.width) / 100
    const y = (mouse.y * viewport.height) / 100

    rotationEuler.set(y, x, 0)
    rotationQuaternion.setFromEuler(rotationEuler)

    group.current.quaternion.slerp(rotationQuaternion, 0.1)
  })

  return (
    <Physics gravity={[0, -10, 0]} >
      {/* <fog args={[0x000000, 5, 60]} attach="fog" /> */}
      <group name="sceneContainer" ref={group}>
        <Octahedron layers={[11]} name="background" args={[20, 4, 4]} position={[0, 0, -5]}>
          <meshMatcapMaterial matcap={matcapTexture} side={THREE.BackSide} />
        </Octahedron>
        <Octahedron name="background" args={[20, 4, 4]} position={[0, 0, -5]}>
          <meshMatcapMaterial matcap={matcapTexture} side={THREE.BackSide} />
        </Octahedron>
        <cubeCamera layers={[11]} name="cubeCamera" ref={camera} args={[0.1, 100, renderTarget]} />
        <TitleCopies position={[0, 2, -5]} rotation={[0, 0, 0]} layers={[11]} label="PEDRO" />
        <Mirrors envMap={renderTarget.texture} />
        <Title name="title" label="PEDRO" position={[0, 2, -10]} color="#fff" />
        <Title layers={[11]} name="title" label="CLICK HERE" position={[0, 2, 10]} scale={[-1,1,1]}/>
        <PhyPlane rotation={[-Math.PI/2, 0, 0]} position={[0, -2, 0]}/>
        {window.location.search.indexOf('ctrl') > -1 && <OrbitControls />}
      </group>
      <pointLight
        castShadow
        position={[0, 10, 2]}
        intensity={4}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={100}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
    </Physics>
  )
}
