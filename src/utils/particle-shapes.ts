/**
 * @file src/utils/particle-shapes.ts
 * @description Utility to sample points from SVG paths for particle effects
 */

import * as THREE from 'three'

/**
 * Samples points from an SVG path string
 * @param pathD The SVG path 'd' attribute string
 * @param numPoints Number of points to sample
 * @param scale Scale factor for the resulting points
 * @param vectorOffset Offset to apply to centered points
 * @returns Array of Vector3 points
 */
export const samplePointsFromPath = (
	pathD: string,
	numPoints: number,
	scale: number = 0.01,
	vectorOffset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
): Float32Array => {
	// Create off-screen canvas
	const size = 500
	const canvas = document.createElement('canvas')
	canvas.width = size
	canvas.height = size
	const ctx = canvas.getContext('2d')

	if (!ctx) {
		console.error('Could not get 2D context')
		return new Float32Array(numPoints * 3)
	}

	// Draw path
	const path = new Path2D(pathD)
	ctx.fillStyle = 'red'

	// Center the path roughly?
	// We'll fill the whole canvas and then find points
	ctx.clearRect(0, 0, size, size)

	// Typically paths might be in different coordinates.
	// Ideally we fit the path to the canvas.
	// For simplicity, we assume paths are roughly in 0-500 range or we center them later.
	ctx.translate(size / 2, size / 2)
	ctx.translate(-250, -250) // Approximating center
	ctx.fill(path)

	// Get pixel data
	const imageData = ctx.getImageData(0, 0, size, size)
	const pixels = imageData.data
	const validPixels: number[] = [] // Indices of valid pixels

	for (let i = 0; i < pixels.length; i += 4) {
		// Check alpha channel
		if (pixels[i + 3] > 128) {
			validPixels.push(i / 4)
		}
	}

	const positions = new Float32Array(numPoints * 3)

	if (validPixels.length === 0) {
		console.warn('No valid pixels found for path')
		return positions
	}

	for (let i = 0; i < numPoints; i++) {
		// Randomly select a valid pixel
		const pixelIndex = validPixels[Math.floor(Math.random() * validPixels.length)]

		// Convert back to x, y
		const x = pixelIndex % size
		const y = Math.floor(pixelIndex / size)

		// Map to 3D space (Center is 0,0)
		// Canvas Y is down, 3D Y is up, so flip Y
		const worldX = (x - size / 2) * scale
		const worldY = -(y - size / 2) * scale
		const worldZ = 0

		positions[i * 3] = worldX + vectorOffset.x
		positions[i * 3 + 1] = worldY + vectorOffset.y
		positions[i * 3 + 2] = worldZ + vectorOffset.z
	}

	return positions
}

/**
 * Helper to generate random points in a box volume
 * Used for the idle state
 */
export const generateRandomParticles = (
	count: number,
	rangeX: number,
	rangeY: number,
	rangeZ: number
): Float32Array => {
	const positions = new Float32Array(count * 3)
	for (let i = 0; i < count; i++) {
		positions[i * 3] = (Math.random() - 0.5) * rangeX
		positions[i * 3 + 1] = (Math.random() - 0.5) * rangeY
		positions[i * 3 + 2] = (Math.random() - 0.5) * rangeZ
	}
	return positions
}
