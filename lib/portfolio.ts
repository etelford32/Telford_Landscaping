/**
 * Portfolio project data — the real, photographed work shown on /portfolio.
 *
 * Each entry maps to an optimized 1600px image in /public/portfolio. Copy is
 * written to sell the craft: what the problem was, how it was built, and what
 * a prospect would be buying. The gallery, the lightbox, and the page's
 * structured data all read from this one array.
 */

export const categories = [
  "All",
  "Fences & Gates",
  "Decks & Carpentry",
  "Walls & Grading",
  "Patios & Stonework",
] as const;

export type Category = (typeof categories)[number];

export interface Project {
  /** URL-safe id; also the image filename in /public/portfolio. */
  slug: string;
  title: string;
  category: Exclude<Category, "All">;
  image: string;
  alt: string;
  /** One-line hook under the card title. */
  tagline: string;
  /** The story, shown in the lightbox. */
  description: string;
  /** Short chips on the card — materials and scope at a glance. */
  specs: string[];
  /** Build details, bulleted in the lightbox. */
  details: string[];
  /**
   * Optional and currently unset — fill in the real city and year for a job
   * and the card + lightbox render them automatically. Left blank rather
   * than guessed, so nothing on this page is a claim we can't back up.
   */
  location?: string;
  year?: string;
}

export const projects: Project[] = [
  {
    slug: "redwood-archway-gate",
    title: "Redwood Archway Gate",
    category: "Fences & Gates",
    image: "/portfolio/redwood-archway-gate.jpg",
    alt: "Custom Berco redwood archway gate with forged iron hardware and integrated low-voltage post lighting, under an oak canopy",
    tagline:
      "A hand-cut arch, forged iron hardware, and low-voltage light built into the posts.",
    description:
      "The entry to a foothill property, built in Berco construction-heart redwood. The arch was laid out and cut on site to the actual opening, so the gate reads as one piece with the fence line instead of a kit dropped into a hole. Forged iron strap hinges and a thumb latch carry the swing. Low-voltage fixtures are integrated into the posts and wired into the fence run, so the entry lights itself at dusk with no conduit stapled to the outside of the wood.",
    specs: ["Berco redwood", "Hand-cut arch", "Low-voltage lighting", "Forged iron hardware"],
    details: [
      "Arch laid out and cut on site to the real opening, not ordered to a stock radius",
      "Construction-heart redwood posts, capped and set in concrete footings",
      "Forged iron strap hinges and thumb latch, sized for a full-weight swing gate",
      "Low-voltage fixtures integrated into the posts and wired into the fence run",
      "Picket reveal held consistent from the gate out through the whole run",
    ],
  },
  {
    slug: "redwood-fence-line",
    title: "Full Redwood Fence Line",
    category: "Fences & Gates",
    image: "/portfolio/redwood-fence-line.jpg",
    alt: "Complete redwood picket and privacy fence line stepping with the grade around a cleared foothill yard",
    tagline: "The whole perimeter in one run — stepped to the grade and squared to the arch.",
    description:
      "The same property from inside the yard. The fence steps down the slope in even increments rather than following every dip in the dirt, so the cap line stays level to the eye across the entire run. Solid privacy panels go up where neighbors are close; open picket keeps the oak canopy and the afternoon light where they earn their keep. Everything is tied back to the archway gate you can see in the middle distance — one fence, not four different ones that happen to meet at the corners.",
    specs: ["Full perimeter", "Stepped to grade", "Continuous cap rail", "Privacy + picket mix"],
    details: [
      "Stepped in even increments so the cap line reads level across the run",
      "Privacy panels where sightlines matter, open picket where the view does",
      "Posts set in concrete; cap rail continuous through corners and transitions",
      "Detailed to match the archway gate, so the whole enclosure reads as one build",
      "Yard cleared and graded to defensible-space depth before the fence went in",
    ],
  },
  {
    slug: "timber-carport",
    title: "Timber-Frame Carport",
    category: "Decks & Carpentry",
    image: "/portfolio/timber-carport.jpg",
    alt: "Timber-frame carport with a single-slope roof and integrated lighting, built against a concrete retaining wall on a hillside",
    tagline: "A single-slope roof on heavy posts, wired for light and fit into the hillside.",
    description:
      "Built against an existing concrete wall on a tight hillside pad, where nothing off a shelf would have fit. The posts land on galvanized standoff bases so end grain never sits in standing water, and the beam carries a single-slope roof with an overhang deep enough that you are not unloading groceries in the rain. Lighting is integrated into the frame rather than hung off it — at six o'clock in December, you can see what you are doing.",
    specs: ["Timber frame", "Single-slope roof", "Integrated lighting", "Standoff post bases"],
    details: [
      "Custom-framed to a hillside pad where a prefab kit would not fit",
      "Galvanized standoff bases keep post end grain up out of standing water",
      "Single-slope roof with a deep overhang over the unloading side",
      "Lighting integrated into the frame, not surface-hung after the fact",
      "Tied into the existing concrete retaining wall rather than fighting it",
    ],
  },
  {
    slug: "flagstone-patio",
    title: "Mortared Flagstone Patio",
    category: "Patios & Stonework",
    image: "/portfolio/flagstone-patio.jpg",
    alt: "Mortared flagstone patio with hand-cut joints, block-edged planting beds, and new sod lawn",
    tagline: "Natural stone set in mortar, cut tight, and tied into new beds and lawn.",
    description:
      "Irregular flagstone, dry-laid out first and then cut piece by piece so the joints stay narrow and the field reads as one surface instead of a pattern. Set in mortar over a compacted base, so nothing rocks underfoot and nothing lifts after a wet winter. The patio runs out from the covered porch to meet new sod, with block-edged beds and mulch holding the planting line behind it — the whole back yard finished in one pass instead of three trades over three seasons.",
    specs: ["Mortar-set flagstone", "Hand-cut joints", "Block-edged beds", "New sod + planting"],
    details: [
      "Stone laid out dry and cut individually for narrow, consistent joints",
      "Mortar set over a compacted base so the field stays flat season to season",
      "Blended slate and sandstone tones chosen to sit with the house, not shout at it",
      "Segmental block edging holds the raised beds and the mulch line",
      "New sod, beds, and shrub planting finished in the same phase as the stone",
    ],
  },
  {
    slug: "redwood-stairs-wall",
    title: "Redwood Staircase & Curved Wall",
    category: "Decks & Carpentry",
    image: "/portfolio/redwood-stairs-wall.jpg",
    alt: "Custom redwood staircase with railing and landing beside a curved segmental block retaining wall on a graded slope",
    tagline: "One grade change solved twice — a stair you can carry groceries up, and a wall that holds the hill.",
    description:
      "The drop from the upper pad to the lower yard was steep enough that people were walking the long way around it. The stair is redwood with a landing, closed risers, and a graspable rail that matches the deck above, so the two read as one structure. Where the stair stops, a curved segmental wall picks up the same grade change, retaining the pad and turning a slope you avoided into an edge you can plant and use. Boulders were set into the cut to break the line and hold the toe.",
    specs: ["Redwood stair + rail", "Curved block wall", "Set boulders", "Regraded slope"],
    details: [
      "Redwood stair with a landing, closed risers, and a graspable handrail",
      "Rail and baluster detail matched to the existing deck above",
      "Curved segmental wall carries the same grade change past the stair",
      "Boulders set into the cut to break the line and hold the toe of the slope",
      "Grade reworked so the lower yard drains away from the structure",
    ],
  },
  {
    slug: "retaining-wall-90ft",
    title: "90-Foot Retaining Wall",
    category: "Walls & Grading",
    image: "/portfolio/retaining-wall-90ft.jpg",
    alt: "Ninety-foot segmental block retaining wall, three and a half feet tall with a stepped second tier, creating a flat back yard",
    tagline: "Ninety feet of block that turned a sliding slope into a flat, usable yard.",
    description:
      "Three and a half feet tall, ninety feet long, stepped to a second tier where the bank gets steeper. Walls this size fail for one of two reasons: no base, or no drainage. This one sits on compacted aggregate below grade, with drain rock and a perforated line behind it carrying water out instead of into the block. Everything behind it was cut, filled, and compacted flat. Photographed mid-build, before finish grade and planting — this is what the part you never see again actually looks like.",
    specs: ["90 linear feet", "3.5 ft tall", "Two-tier step", "Drainage behind the block"],
    details: [
      "90 linear feet of segmental block at a finished height of 3.5 feet",
      "Stepped to a second tier where the bank steepens at the west end",
      "Compacted aggregate base set below grade, leveled course by course",
      "Drain rock and a perforated drain line behind the wall, daylighted out",
      "Yard cut, filled, and compacted to a flat, buildable pad behind the wall",
    ],
  },
  {
    slug: "nature-fence-gate",
    title: "Nature Fencing & Gates",
    category: "Fences & Gates",
    image: "/portfolio/nature-fence-gate.jpg",
    alt: "Redwood-framed welded wire nature fencing with a Z-braced drive gate and matching pedestrian gate, with a flagstone stepping path",
    tagline: "Redwood frames and welded wire — enclosure without giving up the view.",
    description:
      "Framed redwood panels infilled with welded wire, so the yard is genuinely enclosed for dogs and kids while the sightlines and the light stay open. The drive gate is Z-braced across the frame so it does not sag off the hinge side after a season of use, and a matching pedestrian gate sets into the return by the house. The flagstone stepping path and the cobble-edged bed went in on the same job — fencing and the landscape it runs through, from one crew.",
    specs: ["Redwood + welded wire", "Z-braced drive gate", "Matching walk gate", "Stone path + cobble edge"],
    details: [
      "Redwood frames with welded wire infill — contains the yard, keeps the view",
      "Drive gate Z-braced across the frame so it stays square on the hinge side",
      "Matching pedestrian gate set into the return alongside the house",
      "Flagstone stepping path set through the lawn on the same visit",
      "River cobble edging holding the mulch line and new tree planting",
    ],
  },
  {
    slug: "redwood-deck",
    title: "Redwood Deck, Forest Cabin",
    category: "Decks & Carpentry",
    image: "/portfolio/redwood-deck.jpg",
    alt: "Large ground-level redwood platform deck with a picture-frame border and boxed stair, built across the front of a forest cabin",
    tagline: "A low platform deck that turned the front of a cabin into the room everyone uses.",
    description:
      "Ground-level redwood laid across sloping dirt in front of the cabin, framed dead level so the platform is flat even though the ground under it is not. The edge is picture-framed, which means no cut board ends anywhere on the perimeter — the detail that separates a deck built by a carpenter from one built by the hour. Boards run the length to pull the eye out toward the trees, and a boxed stair drops to a poured pad where people actually walk. Under conifers, with year-round needle drop and damp, redwood holds where a cheaper board cups and splits.",
    specs: ["Redwood decking", "Picture-frame border", "Boxed stair", "Ground-level platform"],
    details: [
      "Framed level over sloping ground for a flat, ground-hugging platform",
      "Picture-frame border — no exposed cut board ends on the perimeter",
      "Boards run the long dimension to draw the eye out to the tree line",
      "Boxed stair down to a poured pad on the natural approach to the door",
      "Redwood chosen for needle drop and damp under a conifer canopy",
    ],
  },
];
