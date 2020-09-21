import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, useResource } from 'react-three-fiber'
import { Text, Box, useMatcapTexture, Octahedron, OrbitControls } from 'drei'

import { ThinFilmFresnelMap } from './ThinFilmFresnelMap'
import { mirrorsData, textData } from './data'

const textProps = {
  fontSize: 3.9,
  font: 'https://fonts.gstatic.com/s/raleway/v17/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVtzpbCIPrcVIT9d0c8.woff'
}


function Title({ layers = undefined, ...props}) {
  
  const group = useRef()

  useEffect(() => {
    group.current.lookAt(0, 0, 0)
  }, [])
  
  return (
    <group {...props} ref={group}>
      <Text material-toneMapped={false} position={[-1.8, 0.4, 0]} {...textProps} layers={layers}>
        R
      </Text>
      <Text material-toneMapped={false} position={[0, -0.6, 0]} rotation={[0, 0, -Math.PI / 16]} {...textProps} layers={layers}>
        3
      </Text>
      <Text material-toneMapped={false} position={[1.5, 0.2, 0]} scale={[-1, 1, 1]} {...textProps} layers={layers}>
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

function TitleCopies({ layers }) {
  const vertices = useMemo(() => {
    const y = new THREE.IcosahedronGeometry(8)
    return y.vertices
  }, [])

  return (vertices.map(vertex => <Title position={vertex} layers={layers} />))
}

export default function Scene() {
  const [renderTarget] = useState(
    new THREE.WebGLCubeRenderTarget(1024, { format: THREE.RGBAFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter })
  )

  const camera = useRef()
  const sphere = useRef()

  const [matcapTexture] = useMatcapTexture('C8D1DC_575B62_818892_6E747B', 1024)
  
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
    <group name="sceneContainer" ref={group}>
      <Octahedron layers={[11]} name="background" ref={sphere} args={[20, 4, 4]} position={[0, 0, -5]}>
        <meshMatcapMaterial matcap={matcapTexture} side={THREE.BackSide} transparent opacity={0.3} />
      </Octahedron>

      <cubeCamera layers={[11]} name="cubeCamera" ref={camera} args={[0.1, 100, renderTarget]} position={[0, 0, 5]} />
      
      <Mirrors envMap={renderTarget.texture} />
      
      <Title position={[0, 0, -10]} />
      <TitleCopies layers={[11]} />
      
      {window.location.search.indexOf('ctrl') > -1 && <OrbitControls />}
    </group>
  )
}
