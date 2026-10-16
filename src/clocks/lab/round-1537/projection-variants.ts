export type ProjectionVariant = "room" | "porcelain" | "vermilion" | "plinth";
export type ProjectionUnit = "hour" | "minute" | "second";
type Vector = [number, number, number];

export type ProjectionStyle = {
  camera: Vector;
  target: Vector;
  perspective: boolean;
  fieldOfView?: number;
  viewSize: number;
  wallDistance: number;
  floorDistance: number;
  thickness: number;
  paper: string;
  side: string;
  core: string;
  roughness: number;
  metalness: number;
  ambient: number;
  lights: [number, number, number];
  room: boolean;
  plinth: boolean;
};

export const projectionStyles: Record<ProjectionVariant, ProjectionStyle> = {
  room: {
    camera: [8, 7.5, 9], target: [-1.25, -1, -1.25], perspective: false, viewSize: 4.55,
    wallDistance: 4.1, floorDistance: 3.4, thickness: .12,
    paper: "#fafaf7", side: "#c9ccc8", core: "#343936", roughness: .55, metalness: .12,
    ambient: .65, lights: [1.6, 3.4, 2.2], room: true, plinth: false,
  },
  porcelain: {
    camera: [8.5, 8, 10], target: [-.95, -.7, -.95], perspective: true, fieldOfView: 20, viewSize: 4.85,
    wallDistance: 4.85, floorDistance: 3.6, thickness: .19,
    paper: "#fafaf7", side: "#929b96", core: "#f2f2ed", roughness: .28, metalness: .03,
    ambient: .55, lights: [1.15, 3.1, 2.2], room: false, plinth: false,
  },
  vermilion: {
    camera: [9, 11, 9], target: [-.7, -1.2, -.7], perspective: false, viewSize: 4.75,
    wallDistance: 4.1, floorDistance: 4.5, thickness: .075,
    paper: "#fafaf7", side: "#4e5450", core: "#c1121f", roughness: .34, metalness: .15,
    ambient: .75, lights: [1.3, 2.8, 2.0], room: false, plinth: false,
  },
  plinth: {
    camera: [9.5, 7.5, 8], target: [-.95, -.95, -.8], perspective: true, fieldOfView: 24, viewSize: 5,
    wallDistance: 4.85, floorDistance: 3.65, thickness: .26,
    paper: "#f5f6f2", side: "#252b29", core: "#b4bdba", roughness: .4, metalness: .55,
    ambient: .6, lights: [1.15, 3.4, 2.4], room: false, plinth: true,
  },
};

export function projectionScreens(variant: ProjectionVariant) {
  const style = projectionStyles[variant];
  const wall = style.wallDistance;
  const floor = style.floorDistance;
  const reach = 1.48;
  return (["hour", "minute", "second"] as const).map(unit => {
    const floorPanel = unit === "second";
    const position: Vector = unit === "hour" ? [-wall, 0, 0] : unit === "minute" ? [0, 0, -wall] : [0, -floor, 0];
    const rotation: Vector = unit === "hour" ? [0, Math.PI / 2, 0] : unit === "minute" ? [0, 0, 0] : [-Math.PI / 2, 0, 0];
    const width = style.room ? wall + reach : 2.86;
    const height = style.room ? (floorPanel ? wall + reach : floor + reach) : 2.86;
    const offsetX = style.room ? (unit === "hour" ? (wall - reach) / 2 : (reach - wall) / 2) : 0;
    const offsetY = style.room ? (floorPanel ? (wall - reach) / 2 : (reach - floor) / 2) : 0;
    return { unit, position, rotation, width, height, offsetX, offsetY };
  });
}