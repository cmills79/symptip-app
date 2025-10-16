export const BODY_AREAS = [
  { value: 'Face - Front', label: 'Face (Front View)' },
  { value: 'Face - Left', label: 'Face (Left Profile)' },
  { value: 'Face - Right', label: 'Face (Right Profile)' },
  { value: 'Left Hand', label: 'Left Hand' },
  { value: 'Right Hand', label: 'Right Hand' },
  { value: 'Both Hands', label: 'Both Hands' },
  { value: 'Left Arm', label: 'Left Arm' },
  { value: 'Right Arm', label: 'Right Arm' },
  { value: 'Both Arms', label: 'Both Arms' },
  { value: 'Left Leg', label: 'Left Leg' },
  { value: 'Right Leg', label: 'Right Leg' },
  { value: 'Both Legs', label: 'Both Legs' },
  { value: 'Torso - Front', label: 'Torso (Front)' },
  { value: 'Torso - Back', label: 'Torso (Back)' },
  { value: 'Left Foot', label: 'Left Foot' },
  { value: 'Right Foot', label: 'Right Foot' },
  { value: 'Both Feet', label: 'Both Feet' },
  { value: 'Custom', label: 'Custom Area' },
] as const;

export const SUPPLEMENT_PURPOSES = [
  { value: 'mold', label: 'Mold Treatment' },
  { value: 'fungus', label: 'Fungus Treatment' },
  { value: 'parasite', label: 'Parasite Treatment' },
  { value: 'general', label: 'General Health' },
  { value: 'other', label: 'Other' },
] as const;

export const COMMON_SUPPLEMENTS = [
  // Anti-Fungal
  { name: 'Caprylic Acid', purpose: 'fungus', dosage: '1000mg' },
  { name: 'Oregano Oil', purpose: 'fungus', dosage: '150mg' },
  { name: 'Garlic Extract', purpose: 'fungus', dosage: '500mg' },
  { name: 'Pau d\'Arco', purpose: 'fungus', dosage: '500mg' },
  { name: 'Grapefruit Seed Extract', purpose: 'fungus', dosage: '250mg' },

  // Anti-Parasitic
  { name: 'Black Walnut Hull', purpose: 'parasite', dosage: '500mg' },
  { name: 'Wormwood', purpose: 'parasite', dosage: '300mg' },
  { name: 'Clove', purpose: 'parasite', dosage: '500mg' },
  { name: 'Berberine', purpose: 'parasite', dosage: '500mg' },
  { name: 'Diatomaceous Earth', purpose: 'parasite', dosage: '1 tsp' },

  // Mold Detox
  { name: 'Activated Charcoal', purpose: 'mold', dosage: '500mg' },
  { name: 'Bentonite Clay', purpose: 'mold', dosage: '1 tsp' },
  { name: 'Glutathione', purpose: 'mold', dosage: '500mg' },
  { name: 'N-Acetyl Cysteine (NAC)', purpose: 'mold', dosage: '600mg' },
  { name: 'Milk Thistle', purpose: 'mold', dosage: '300mg' },

  // General Support
  { name: 'Vitamin C', purpose: 'general', dosage: '1000mg' },
  { name: 'Vitamin D3', purpose: 'general', dosage: '5000 IU' },
  { name: 'Probiotics', purpose: 'general', dosage: '50 billion CFU' },
  { name: 'Zinc', purpose: 'general', dosage: '30mg' },
  { name: 'Magnesium', purpose: 'general', dosage: '400mg' },
] as const;

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
] as const;

export const TIMELAPSE_PRESETS = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 60, label: '60 Days' },
  { value: 90, label: '90 Days' },
  { value: 180, label: '6 Months' },
  { value: 365, label: '1 Year' },
] as const;

export const VIDEO_RESOLUTIONS = [
  { value: '720p', label: '720p (HD)' },
  { value: '1080p', label: '1080p (Full HD)' },
] as const;

export const TRANSITION_STYLES = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'none', label: 'None' },
] as const;

export const ANNOTATION_COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
] as const;
