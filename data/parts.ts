// All numeric specs are placeholders marked TODO. Replace them with verified figures
// from official Aprilia documentation before publishing. Do not guess numbers here.

export type PartId =
  | 'fairing'
  | 'tank'
  | 'seat'
  | 'engine'
  | 'exhaust'
  | 'wheels'
  | 'forks'
  | 'swingarm'
  | 'electronics'
  | 'frame'

export type Spec = { label: string; value: string; todo?: boolean }

export type Vec3 = [number, number, number]

export type Part = {
  id: PartId
  name: string
  system: string
  pitch: string
  specs: Spec[]
  why: string
  side: 'left' | 'right'
  rig: {
    /** Local anchor point used for the camera focus and the leader line. */
    anchor: Vec3
    /** Direction + distance the part travels when the bike disassembles. */
    explode: Vec3
    /** Camera orbit around the focus point: azimuth/elevation in degrees, radius in units. */
    camera: { az: number; el: number; r: number }
    /** Keywords used to auto-assign meshes when a real GLB is loaded. */
    keywords: string[]
  }
}

const todo = (unit?: string): Spec['value'] => (unit ? `TODO ${unit}` : 'TODO')

export const PARTS: Part[] = [
  {
    id: 'fairing',
    name: 'Fairing',
    system: 'AERO',
    pitch: 'A hard shell that slices air so the rider does not have to.',
    specs: [
      { label: 'Construction', value: todo(), todo: true },
      { label: 'Mass', value: todo('kg'), todo: true },
      { label: 'Drag coeff.', value: todo('Cd'), todo: true },
      { label: 'Aero devices', value: todo(), todo: true },
    ],
    why: 'Bodywork decides how cleanly the bike punches through air and how calm the rider stays behind the screen.',
    side: 'left',
    rig: {
      anchor: [0.58, 0.78, 0],
      explode: [0.85, 0.35, 0.55],
      camera: { az: 55, el: 12, r: 4.6 },
      keywords: ['fairing', 'body', 'cowl', 'panel', 'plastic', 'windscreen', 'screen', 'shell', 'nose', 'paint'],
    },
  },
  {
    id: 'tank',
    name: 'Fuel Tank',
    system: 'FUEL',
    pitch: 'The torso of the bike. Knees lock in here when the brakes bite.',
    specs: [
      { label: 'Capacity', value: todo('L'), todo: true },
      { label: 'Reserve', value: todo('L'), todo: true },
      { label: 'Material', value: todo(), todo: true },
      { label: 'Filler', value: todo(), todo: true },
    ],
    why: 'Range, mass centralisation and rider grip all start with the shape and position of the tank.',
    side: 'right',
    rig: {
      anchor: [0.2, 0.92, 0],
      explode: [0.05, 0.65, 0.1],
      camera: { az: 22, el: 34, r: 4.4 },
      keywords: ['tank', 'fuel', 'cap'],
    },
  },
  {
    id: 'seat',
    name: 'Seat + Tail',
    system: 'ERGO',
    pitch: 'Where the rider lives, and where the silhouette ends sharp.',
    specs: [
      { label: 'Seat height', value: todo('mm'), todo: true },
      { label: 'Pillion', value: todo(), todo: true },
      { label: 'Foam', value: todo(), todo: true },
      { label: 'Subframe', value: todo(), todo: true },
    ],
    why: 'Seat height and shape decide who can reach the ground and how easily weight shifts in a corner.',
    side: 'left',
    rig: {
      anchor: [-0.4, 0.88, 0],
      explode: [-0.5, 0.5, 0.05],
      camera: { az: -42, el: 24, r: 4.4 },
      keywords: ['seat', 'saddle', 'tail', 'rear_cowl', 'pillion'],
    },
  },
  {
    id: 'engine',
    name: 'Engine',
    system: 'POWER',
    pitch: 'The heart. A compact twin built to rev and pull out of corners.',
    specs: [
      { label: 'Layout', value: 'Parallel twin' },
      { label: 'Displacement', value: '457 cc' },
      { label: 'Bore × stroke', value: todo('mm'), todo: true },
      { label: 'Peak power', value: todo('hp'), todo: true },
      { label: 'Peak torque', value: todo('Nm'), todo: true },
    ],
    why: 'Character, top speed and how forgiving the bike feels mid-corner are all written here.',
    side: 'right',
    rig: {
      anchor: [0.1, 0.5, 0],
      explode: [0, 0.02, 0.85],
      camera: { az: 8, el: 6, r: 4.0 },
      keywords: ['engine', 'motor', 'cylinder', 'crank', 'clutch', 'block', 'head', 'radiator'],
    },
  },
  {
    id: 'exhaust',
    name: 'Exhaust',
    system: 'FLOW',
    pitch: 'Spent gas out, sound and mass tucked low under the belly.',
    specs: [
      { label: 'Layout', value: todo(), todo: true },
      { label: 'Material', value: todo(), todo: true },
      { label: 'Catalyst', value: todo(), todo: true },
      { label: 'Mass', value: todo('kg'), todo: true },
    ],
    why: 'Routing the exhaust low keeps the centre of mass down and shapes the voice of the engine.',
    side: 'left',
    rig: {
      anchor: [0.0, 0.17, 0],
      explode: [-0.25, 0.05, -0.85],
      camera: { az: -150, el: 8, r: 4.4 },
      keywords: ['exhaust', 'muffler', 'pipe', 'silencer', 'header', 'collector'],
    },
  },
  {
    id: 'wheels',
    name: 'Wheels + Brakes',
    system: 'CONTACT',
    pitch: 'Two contact patches the size of a palm. Everything ends here.',
    specs: [
      { label: 'Front tyre', value: todo(), todo: true },
      { label: 'Rear tyre', value: todo(), todo: true },
      { label: 'Front disc', value: todo('mm'), todo: true },
      { label: 'ABS', value: todo(), todo: true },
    ],
    why: 'Unsprung mass and braking feel decide how hard you can trust the front end.',
    side: 'right',
    rig: {
      anchor: [0.7, 0.3, 0],
      explode: [0, 0, 0.8],
      camera: { az: 10, el: 10, r: 5.2 },
      keywords: ['wheel', 'tire', 'tyre', 'rim', 'brake', 'disc', 'caliper', 'hub', 'spoke'],
    },
  },
  {
    id: 'forks',
    name: 'Front End',
    system: 'STEER',
    pitch: 'Fork, yokes and clip-ons. The bike talks to your hands here.',
    specs: [
      { label: 'Fork type', value: todo(), todo: true },
      { label: 'Diameter', value: todo('mm'), todo: true },
      { label: 'Travel', value: todo('mm'), todo: true },
      { label: 'Adjustment', value: todo(), todo: true },
    ],
    why: 'Front suspension sets how much feedback reaches the rider on the brakes and at the apex.',
    side: 'left',
    rig: {
      anchor: [0.58, 0.64, 0],
      explode: [0.8, 0.3, -0.4],
      camera: { az: 72, el: 10, r: 4.4 },
      keywords: ['fork', 'handle', 'bar', 'clip', 'yoke', 'triple', 'stanchion', 'fender', 'mudguard'],
    },
  },
  {
    id: 'swingarm',
    name: 'Swingarm',
    system: 'TRACTION',
    pitch: 'The lever that plants the rear tyre when you open the throttle.',
    specs: [
      { label: 'Material', value: todo(), todo: true },
      { label: 'Rear shock', value: todo(), todo: true },
      { label: 'Travel', value: todo('mm'), todo: true },
      { label: 'Final drive', value: todo(), todo: true },
    ],
    why: 'Swingarm stiffness and shock setup decide how cleanly power becomes forward drive.',
    side: 'right',
    rig: {
      anchor: [-0.4, 0.38, 0],
      explode: [-0.6, 0, -0.55],
      camera: { az: -120, el: 16, r: 4.4 },
      keywords: ['swing', 'shock', 'chain', 'sprocket', 'spring', 'damper', 'linkage'],
    },
  },
  {
    id: 'electronics',
    name: 'Electronics',
    system: 'CONTROL',
    pitch: 'Lights, dash and the brain that keeps the twin in check.',
    specs: [
      { label: 'Display', value: todo(), todo: true },
      { label: 'Ride modes', value: todo(), todo: true },
      { label: 'Traction ctrl', value: todo(), todo: true },
      { label: 'Lighting', value: todo(), todo: true },
    ],
    why: 'Rider aids turn raw output into something usable on cold tyres and wet tarmac.',
    side: 'left',
    rig: {
      anchor: [0.52, 0.98, 0],
      explode: [0.4, 0.8, -0.45],
      camera: { az: 50, el: 36, r: 4.4 },
      keywords: ['light', 'lamp', 'dash', 'display', 'tft', 'mirror', 'led', 'indicator', 'ecu', 'battery', 'glass'],
    },
  },
  {
    id: 'frame',
    name: 'Frame',
    system: 'CHASSIS',
    pitch: 'The spine. Every other system hangs off these tubes.',
    specs: [
      { label: 'Type', value: todo(), todo: true },
      { label: 'Material', value: todo(), todo: true },
      { label: 'Mass', value: todo('kg'), todo: true },
      { label: 'Rake', value: todo('°'), todo: true },
    ],
    why: 'Frame stiffness and geometry set the baseline for stability, agility and feel.',
    side: 'right',
    rig: {
      anchor: [0.1, 0.72, 0],
      explode: [0, 0.1, -0.15],
      camera: { az: 26, el: 22, r: 4.6 },
      keywords: ['frame', 'chassis', 'subframe', 'spar', 'trellis'],
    },
  },
]

export const PART_BY_ID = Object.fromEntries(PARTS.map((p) => [p.id, p])) as Record<PartId, Part>
export const PART_INDEX = Object.fromEntries(PARTS.map((p, i) => [p.id, i])) as Record<PartId, number>

export type Stat = { label: string; value: number; suffix: string; todo?: boolean }

/** Count-up stats shown during the engine stage. */
export const ENGINE_STATS: Stat[] = [
  { label: 'Displacement', value: 457, suffix: 'CC' },
  { label: 'Cylinders', value: 2, suffix: 'CYL' },
  { label: 'Peak output', value: 0, suffix: 'HP', todo: true },
]
