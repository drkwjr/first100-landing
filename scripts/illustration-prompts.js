/**
 * First 100 Illustration Prompts
 * 
 * This file defines the style guide and object prompts for generating
 * consistent, child-friendly illustrations using OpenAI's gpt-image-1.5 model.
 */

/**
 * Core style guide applied to all illustrations.
 * This ensures visual consistency across all generated images.
 */
export const STYLE_GUIDE = `
Flat vector illustration style.
Soft rounded shapes with smooth curves.
Simple geometry, minimal detail.
Bright but gentle colors (pastel-leaning, nothing harsh).
No harsh contrast or sharp edges.
Friendly, neutral, non-scary aesthetic suitable for toddlers.
High clarity at small sizes (32px-64px must be recognizable).
No text, letters, numbers, or symbols anywhere in the illustration.
No scenery, backgrounds, or environmental context.
No ground line, floor shadows, or drop shadows.
No strokes or outlines around shapes.
Minimal shading - flat colors preferred, subtle gradients allowed sparingly.
Rounded corners on all applicable shapes.
Single isolated object centered on a pure white or transparent background.
Pure white background only when transparency is not available.
No glow, bloom, aura, vignette, spotlight, gradient background, or atmospheric lighting.
No soft edge fade around the object; keep clean crisp edges.
Style similar to modern educational apps for young children.
`.trim();

/**
 * Object definitions for illustration generation.
 * Each object has:
 * - id: unique identifier for the file name
 * - prompt: specific description of the object
 * - category: grouping for organization
 */
export const OBJECTS = [
  // Animals
  { id: 'cat', prompt: 'A sitting cat facing forward, orange tabby with simple friendly round eyes', category: 'animals' },
  { id: 'dog', prompt: 'A sitting dog facing forward, golden retriever puppy with happy expression and tongue out slightly', category: 'animals' },
  { id: 'bird', prompt: 'A small songbird perched, bright blue with orange chest, side profile', category: 'animals' },
  { id: 'fish', prompt: 'A single goldfish swimming, orange with simple fins, side view', category: 'animals' },
  { id: 'butterfly', prompt: 'A butterfly with wings spread open, symmetrical, blue and purple wings', category: 'animals' },
  { id: 'elephant', prompt: 'A baby elephant facing slightly to the side, gray with big ears and small trunk raised', category: 'animals' },
  { id: 'rabbit', prompt: 'A sitting bunny rabbit, white with long ears up, facing forward', category: 'animals' },
  { id: 'duck', prompt: 'A yellow rubber duck or duckling, classic friendly shape, side view', category: 'animals' },
  { id: 'bear', prompt: 'A friendly teddy-style bear sitting facing forward, soft brown with round ears and gentle expression', category: 'animals' },
  
  // Food
  { id: 'apple', prompt: 'A single red apple with a small green leaf on a short brown stem', category: 'food' },
  { id: 'banana', prompt: 'A single yellow banana, slightly curved, bright and ripe', category: 'food' },
  { id: 'orange', prompt: 'A whole orange fruit with small dimpled texture and tiny green leaf', category: 'food' },
  { id: 'strawberry', prompt: 'A single red strawberry with green leaves on top and visible seeds', category: 'food' },
  { id: 'carrot', prompt: 'An orange carrot with green leafy top, tapered shape', category: 'food' },
  { id: 'cookie', prompt: 'A round chocolate chip cookie, golden brown with visible chips', category: 'food' },
  { id: 'milk', prompt: 'A glass of white milk, simple cylindrical glass shape', category: 'food' },
  { id: 'bread', prompt: 'A slice of bread, light tan/beige color, simple rectangular shape with rounded top', category: 'food' },
  
  // Objects
  { id: 'ball', prompt: 'A simple round ball with two-tone colors, red and white sections like a beach ball', category: 'toys' },
  { id: 'blocks', prompt: 'Three colorful stacking blocks in red, blue, and yellow, arranged in a small stack', category: 'toys' },
  { id: 'teddy', prompt: 'A sitting teddy bear, brown plush with round ears and friendly face', category: 'toys' },
  { id: 'car', prompt: 'A simple toy car, red with visible wheels, side profile', category: 'toys' },
  { id: 'star', prompt: 'A five-pointed star, bright yellow/gold, filled solid', category: 'shapes' },
  { id: 'heart', prompt: 'A simple heart shape, solid pink/red, symmetrical', category: 'shapes' },
  { id: 'moon', prompt: 'A crescent moon, pale yellow/cream color, simple curved shape', category: 'nature' },
  { id: 'sun', prompt: 'A happy sun with simple rays extending outward, warm yellow/orange', category: 'nature' },
  { id: 'flower', prompt: 'A simple daisy flower, white petals with yellow center, single green stem', category: 'nature' },
  { id: 'tree', prompt: 'A simple tree with brown trunk and round green leafy top, stylized', category: 'nature' },
  { id: 'cloud', prompt: 'A fluffy white cloud, simple rounded cumulus shape', category: 'nature' },
  { id: 'rainbow', prompt: 'A simple rainbow arc with traditional ROYGBIV colors, semicircle', category: 'nature' },

  // Numbers
  { id: 'one', prompt: 'A single counting block, bright blue, centered', category: 'numbers' },
  { id: 'two', prompt: 'Two matching counting blocks, blue and green, side by side', category: 'numbers' },
  { id: 'three', prompt: 'Three small counting blocks in a neat row, red yellow and blue', category: 'numbers' },
  { id: 'four', prompt: 'Four rounded pebbles arranged in a square, soft pastel colors', category: 'numbers' },
  { id: 'five', prompt: 'Five colorful counting beads arranged in a shallow arc', category: 'numbers' },
  { id: 'six', prompt: 'Six soft round dots arranged in two rows of three, rainbow colors', category: 'numbers' },
  { id: 'seven', prompt: 'Seven counting beads arranged on a gentle curved line', category: 'numbers' },
  { id: 'eight', prompt: 'Eight small stars arranged in a neat circular ring', category: 'numbers' },

  // Feelings
  { id: 'happy', prompt: 'A friendly smiling face icon, round yellow face with bright eyes', category: 'feelings' },
  { id: 'sad', prompt: 'A gentle sad face icon, round blue face with a downturned mouth', category: 'feelings' },
  { id: 'excited', prompt: 'A joyful excited face icon with wide smile and tiny sparkle accents', category: 'feelings' },
  { id: 'calm', prompt: 'A peaceful calm face icon with closed eyes and a soft smile, pastel teal', category: 'feelings' },

  // Concepts
  { id: 'love', prompt: 'Two overlapping heart shapes, pink and red, simple and soft', category: 'concepts' },
  { id: 'friendship', prompt: 'Two friendly child-like figures standing side by side with arms around each other', category: 'concepts' },
  { id: 'kindness', prompt: 'Two open hands with dark brown skin tones gently holding a small heart', category: 'concepts' },
  { id: 'sharing', prompt: 'Two hands passing a toy block to each other', category: 'concepts' },

  // Objects
  { id: 'clock', prompt: 'A simple round wall clock with short and long hands, pastel frame', category: 'objects' },
  { id: 'key', prompt: 'A classic simple key, golden color with a rounded head', category: 'objects' },
  { id: 'gift', prompt: 'A wrapped gift box with a ribbon bow, red and cream colors', category: 'objects' },

  // Transport & everyday objects
  { id: 'rocket', prompt: 'A simple toy rocket, red and white, upright with rounded fins', category: 'transport' },
  { id: 'bicycle', prompt: 'A child bicycle in side view, blue frame with simple wheels', category: 'transport' },
  { id: 'train', prompt: 'A friendly toy train engine, side view, colorful and rounded', category: 'transport' },
  { id: 'airplane', prompt: 'A small passenger airplane in side view, simple rounded shape', category: 'transport' },
  { id: 'boat', prompt: 'A small sailboat with one triangular sail, simple child-friendly style', category: 'transport' },
  { id: 'backpack', prompt: 'A child backpack, teal with a front pocket and rounded top', category: 'objects' },
  { id: 'umbrella', prompt: 'A simple open umbrella, rainbow colors with curved handle', category: 'objects' },

  // More variety set
  { id: 'toothbrush', prompt: 'A child toothbrush, blue and white with soft bristles', category: 'objects' },
  { id: 'spoon', prompt: 'A single spoon, silver with rounded handle', category: 'objects' },
  { id: 'glasses', prompt: 'A pair of round eyeglasses, friendly simple frame', category: 'objects' },
  { id: 'puzzle', prompt: 'A jigsaw puzzle piece, bright green with rounded tabs', category: 'toys' },
  { id: 'drum', prompt: 'A small toy drum with two drumsticks crossed on top', category: 'toys' },
  { id: 'kite', prompt: 'A diamond kite with a tail and bows, bright friendly colors', category: 'toys' },
  { id: 'telescope', prompt: 'A child telescope on a simple tripod, blue and orange', category: 'objects' },
  
  // Clothing & Body
  { id: 'shoe', prompt: 'A single child sneaker shoe, red with white sole, side view', category: 'clothing' },
  { id: 'hat', prompt: 'A simple baseball cap, blue, side/front view', category: 'clothing' },
  
  // Household
  { id: 'cup', prompt: 'A simple drinking cup or mug, blue with a handle, side view', category: 'household' },
  { id: 'book', prompt: 'A closed book, red cover, slightly angled view showing spine', category: 'household' },
  { id: 'chair', prompt: 'A simple wooden chair, brown, front-angled view', category: 'household' },
];

/**
 * Build a complete prompt for a given object.
 * Combines the specific object description with the style guide.
 */
export function buildPrompt(object) {
  return `${object.prompt}. ${STYLE_GUIDE}`;
}

/**
 * Get all objects in a specific category.
 */
export function getObjectsByCategory(category) {
  return OBJECTS.filter(obj => obj.category === category);
}

/**
 * Get all unique categories.
 */
export function getCategories() {
  return [...new Set(OBJECTS.map(obj => obj.category))];
}

/**
 * Get an object by its ID.
 */
export function getObjectById(id) {
  return OBJECTS.find(obj => obj.id === id);
}

/**
 * Estimate cost for generating illustrations.
 * gpt-image-1.5 pricing (approximate):
 * - Medium quality 1024x1024: ~$0.02-0.05 per image
 */
export function estimateCost(count) {
  const avgCostPerImage = 0.04; // Conservative estimate
  return {
    estimated: count * avgCostPerImage,
    min: count * 0.02,
    max: count * 0.05,
    count
  };
}
