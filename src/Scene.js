import React, { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, useResource } from 'react-three-fiber'
import { Text, Box, useMatcapTexture, Octahedron, OrbitControls } from 'drei'

import { ThinFilmFresnelMap } from './ThinFilmFresnelMap'
import { mirrorsData, textData } from './data'

const textProps = {
  fontSize: 3.9,
  font: 'https://fonts.gstatic.com/s/raleway/v17/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVtzpbCIPrcVIT9d0c8.woff'
}


function ResponsiveText(props) {
  
  return (
    <group {...props}>
      <Text position={[-1.8, 0.4, 0]} {...textProps}>
        R
      </Text>
      <Text position={[0, -0.6, 0]} rotation={[0, 0, -Math.PI / 16]} {...textProps}>
        3
      </Text>
      <Text position={[1.5, 0.2, 0]} scale={[-1, 1, 1]} {...textProps}>
        F
      </Text>
    </group>
  )
}

function Mirror({ sideMaterial, reflectionMaterial, args, ...props }) {
  const ref = useRef()

  useFrame(() => {
    ref.current.rotation.y += 0.001
    ref.current.rotation.z += 0.01
  })

  return (
    <Box {...props} ref={ref} args={args}
      material={[
        sideMaterial,
        sideMaterial,
        sideMaterial,
        sideMaterial,
        reflectionMaterial,
        reflectionMaterial
      ]}
    />
  )
}

function Mirrors({ envMap }) {

  const sideMaterial = useResource()
  const reflectionMaterial = useResource()
  const [thinFilmFresnelMap] = useState(new ThinFilmFresnelMap())
  
  return (
    <group name="mirrors">

        <meshLambertMaterial ref={sideMaterial} map={thinFilmFresnelMap} color={0xaaaaaa} />
        <meshLambertMaterial ref={reflectionMaterial} map={thinFilmFresnelMap} envMap={envMap}/>
      
        {mirrorsData.mirrors.map((mirror, index) => (
          <Mirror 
            key={`0${index}`} {...mirror} 
            sideMaterial={sideMaterial.current}
            reflectionMaterial={reflectionMaterial.current}
          />
        ))}
      </group>
  )

}

export default function Scene() {
  const [renderTarget] = useState(
    new THREE.WebGLCubeRenderTarget(1024, { format: THREE.RGBAFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter })
  )

  const camera = useRef()
  const sphere = useRef()

  const [matcapTexture] = useMatcapTexture('C8D1DC_575B62_818892_6E747B', 1024)

  useFrame(({ gl, scene }) => {
    sphere.current.visible = true
    camera.current.update(gl, scene)
    sphere.current.visible = false
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
    <group ref={group}>
      <Octahedron ref={sphere} args={[20, 4, 4]} position={[0, 0, -5]}>
        <meshMatcapMaterial matcap={matcapTexture} side={THREE.BackSide} transparent opacity={0.3} />
      </Octahedron>
      <cubeCamera ref={camera} args={[0.1, 100, renderTarget]} position={[0, 0, 5]} />
      
      <Mirrors envMap={renderTarget.texture} />
      
      <group name="text" position={[0, 0, 5]}>
        {textData.map((data, index) => ( <ResponsiveText key={index} {...data} /> ))}
      </group>
      <OrbitControls />
    </group>
  )
}
