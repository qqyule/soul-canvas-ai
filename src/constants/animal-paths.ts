/**
 * @file src/constants/animal-paths.ts
 * @description SVG path data for Chinese traditional animals
 * Used for particle gathering effects
 */

export const ANIMAL_PATHS = {
	// Simplified silhouettes for demonstration.
	// In a real production environment, these would be high-res SVG paths.

	// 龙 (Dragon) - Coiling shape
	DRAGON:
		'M150,150 C150,100 200,50 250,50 S350,100 350,150 S300,250 250,250 S150,200 150,150 M250,50 C280,20 320,20 350,50 M150,150 C120,180 120,220 150,250 M250,250 C280,280 320,280 350,250',

	// 凤 (Phoenix) - Spread wings
	PHOENIX:
		'M100,200 Q150,100 250,200 T400,200 M250,200 L250,300 L200,350 L300,350 L250,300 M250,200 Q300,100 400,150',

	// 马 (Horse) - Galloping
	HORSE:
		'M100,250 L150,150 L250,150 L300,200 L300,300 L250,300 L200,250 L150,300 L100,250 M250,150 L280,100 L320,120 L300,150',

	// 牛 (Ox) - Strong stance
	OX: 'M150,200 L350,200 L350,300 L300,300 L300,250 L200,250 L200,300 L150,300 Z M150,200 Q200,150 250,200 Q300,150 350,200',

	// 猪 (Pig) - Round body
	PIG: 'M150,200 A100,80 0 1,1 350,200 A100,80 0 1,1 150,200 M150,180 L130,150 L160,160 M350,180 L370,150 L340,160',
} as const

export type AnimalType = keyof typeof ANIMAL_PATHS
