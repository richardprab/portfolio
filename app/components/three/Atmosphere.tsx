"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import {
  cloudSeaFragmentShader,
  cloudSeaVertexShader,
  skyFragmentShader,
  skyVertexShader,
} from "./shaders";
import { useAscentStore } from "./store";
import { ascentFrame } from "./frame";
import { CAMPS } from "./camps";
import { ASCENT_CONFIG } from "../../config/animations";

interface AtmosphereProps {
  quality: "low" | "high" | "soft";
}

const SKY_RADIUS = 420;
const STAR_RADIUS = 380;

export const Atmosphere = ({ quality }: AtmosphereProps) => {
  const fogRef = useRef<THREE.FogExp2>(null);
  const starsRef = useRef<THREE.PointsMaterial>(null);
  const fineStarsRef = useRef<THREE.PointsMaterial>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const warmRef = useRef<THREE.DirectionalLight>(null);

  const skyMaterial = useMemo(() => {
    const palette = useAscentStore.getState().palette;
    return new THREE.ShaderMaterial({
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uSky: { value: new THREE.Color(palette.sky) },
        uHorizon: { value: new THREE.Color(palette.horizon) },
        uAccent: { value: new THREE.Color(palette.accent) },
        uWarmth: { value: ascentFrame.warmth },
        uDim: { value: 0 },
        uTime: { value: 0 },
        uDay: { value: 0 },
      },
    });
  }, []);

  // The cloud sea: one quad in the valleys, all texture from noise.
  const cloudMaterial = useMemo(() => {
    const palette = useAscentStore.getState().palette;
    return new THREE.ShaderMaterial({
      vertexShader: cloudSeaVertexShader,
      fragmentShader: cloudSeaFragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color("#9fb0cd") },
        uShade: { value: new THREE.Color("#39445f") },
        uAccent: { value: new THREE.Color(palette.accent) },
        uTime: { value: 0 },
        uDay: { value: 0 },
      },
    });
  }, []);

  const makeStarDome = (count: number, seed: number) => {
    const positions = new Float32Array(count * 3);
    let s = seed;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    for (let i = 0; i < count; i++) {
      const azimuth = rand() * Math.PI * 2;
      const elevation = Math.asin(0.08 + rand() * 0.9);
      positions[i * 3] = STAR_RADIUS * Math.cos(elevation) * Math.cos(azimuth);
      positions[i * 3 + 1] = STAR_RADIUS * Math.sin(elevation);
      positions[i * 3 + 2] = STAR_RADIUS * Math.cos(elevation) * Math.sin(azimuth);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  };

  const starGeometry = useMemo(
    () => makeStarDome(quality === "high" ? 1200 : quality === "low" ? 700 : 400, 1234567),
    [quality]
  );
  // A second, finer field for depth (skipped on the low tier).
  const fineStarGeometry = useMemo(
    () => (quality === "high" ? makeStarDome(2400, 987654) : null),
    [quality]
  );

  useEffect(() => {
    return () => {
      skyMaterial.dispose();
      cloudMaterial.dispose();
    };
  }, [skyMaterial, cloudMaterial]);

  useEffect(() => {
    return () => {
      starGeometry.dispose();
      fineStarGeometry?.dispose();
    };
  }, [starGeometry, fineStarGeometry]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const { palette, reducedMotion } = useAscentStore.getState();
    const u = skyMaterial.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uDay.value = ascentFrame.dayT;
    cloudMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    cloudMaterial.uniforms.uDay.value = ascentFrame.dayT;
    // Scene lights follow the hour: dim moonlight at the trailhead, the
    // warm sun strengthening as the climb rises.
    const day = ascentFrame.dayT;
    if (hemiRef.current) hemiRef.current.intensity = 0.28 + day * 0.5;
    if (keyRef.current) {
      keyRef.current.intensity = 0.22 + day * 0.45;
      // The key light swings from the MOON's side of the sky to the dawn's
      // low azimuth — props shade from the same sun the terrain does.
      keyRef.current.position.set(44 - day * 84, 55 - day * 33, -34 + day * 60);
    }
    if (warmRef.current) warmRef.current.intensity = 0.12 + day * 0.75;
    const fog = fogRef.current;
    const stars = starsRef.current;
    if (reducedMotion) {
      (u.uSky.value as THREE.Color).set(palette.sky);
      (u.uHorizon.value as THREE.Color).set(palette.horizon);
      (u.uAccent.value as THREE.Color).set(palette.accent);
      u.uWarmth.value = ascentFrame.warmth;
      u.uDim.value = ascentFrame.dim;
      if (fog) {
        fog.color.set(palette.fog);
        fog.density = ascentFrame.fogDensity;
      }
      if (stars) stars.opacity = palette.starOpacity;
      return;
    }
    const smooth = ASCENT_CONFIG.ATMOS_SMOOTH_TIME;
    easing.dampC(u.uSky.value as THREE.Color, palette.sky, smooth, delta);
    easing.dampC(u.uHorizon.value as THREE.Color, palette.horizon, smooth, delta);
    easing.dampC(u.uAccent.value as THREE.Color, palette.accent, smooth, delta);
    easing.damp(u.uWarmth, "value", ascentFrame.warmth, smooth, delta);
    easing.damp(u.uDim, "value", ascentFrame.dim, 0.35, delta);
    if (fog) {
      easing.dampC(fog.color, palette.fog, smooth, delta);
      easing.damp(fog, "density", ascentFrame.fogDensity, smooth, delta);
    }
    if (stars) {
      // Stars own the night and surrender to the dawn.
      easing.damp(stars, "opacity", palette.starOpacity * (1 - day * 0.8), smooth, delta);
    }
    if (fineStarsRef.current && stars) {
      fineStarsRef.current.opacity = stars.opacity * 0.55;
    }
  });

  return (
    <>
      <fogExp2 ref={fogRef} attach="fog" args={["#16202f", CAMPS[0].fogDensity]} />
      {/* Cool slate sky / dark ground: a white overhead hemisphere lit
          every prop's top like a second sun. */}
      <hemisphereLight ref={hemiRef} args={["#93a5c6", "#1a2233"]} intensity={0.35} />
      <directionalLight ref={keyRef} position={[40, 60, 20]} intensity={0.3} />
      {/* The rising sun's backlight, strengthening through the climb. */}
      <directionalLight ref={warmRef} position={[-46, 16, 22]} intensity={0.15} color="#f2a541" />
      <mesh material={skyMaterial}>
        <sphereGeometry args={[SKY_RADIUS, quality === "soft" ? 24 : 32, quality === "soft" ? 12 : 16]} />
      </mesh>
      {/* The sea of cloud below the climb. On software WebGL the sea is the
          single worst pixel: a near-fullscreen transparent quad running a
          noise shader over terrain already shaded once. */}
      {quality !== "soft" && (
        <mesh material={cloudMaterial} position={[0, 6.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[300, 300]} />
        </mesh>
      )}
      <points geometry={starGeometry}>
        <pointsMaterial
          ref={starsRef}
          size={1.4}
          sizeAttenuation={false}
          color="#ffffff"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
      {fineStarGeometry && (
        <points geometry={fineStarGeometry}>
          <pointsMaterial
            ref={fineStarsRef}
            size={0.8}
            sizeAttenuation={false}
            color="#cfd8ee"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </points>
      )}
    </>
  );
};
