/**
 * One entry per town we serve. Each becomes a landing page at /<slug>
 * (app/(marketing)/[area]/page.tsx) and a row in the header's Service Areas
 * menu, the homepage list, the footer, and the sitemap.
 *
 * The copy sticks to ground conditions a local will recognise and to work we
 * can show. Photos are real jobs but are not labelled with a town, because
 * the portfolio doesn't record one — so nothing here claims a project
 * happened somewhere it didn't.
 */
import { Droplets, Fence, Flame, Home, Mountain, Ruler, Shovel, Trees, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "./siteConfig";

export interface AreaCondition {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface AreaService {
  /** Must match an href in lib/services.ts. */
  href: string;
  /** Why this service matters in this town in particular. */
  why: string;
}

export interface ServiceArea {
  /** URL path segment, e.g. "granite-bay-landscaping". */
  slug: string;
  city: (typeof siteConfig.cities)[number];
  /** One line for the homepage list. */
  note: string;
  metaTitle: string;
  metaDescription: string;
  /** Hero headline. Wrap the accent words in {{ }}. */
  headline: string;
  intro: string;
  heroImage: { src: string; alt: string; caption: string };
  conditionsHeading: string;
  conditions: AreaCondition[];
  services: AreaService[];
  /** Portfolio slugs (lib/portfolio.ts) to show as recent work. */
  work: string[];
  neighborhoods: string[];
  /** Places just outside town that are on the same routes. */
  nearby: string[];
  faqs: { q: string; a: string }[];
}

const LICENSE_FAQ = {
  q: "Are you licensed and insured?",
  a: `Yes. ${siteConfig.legalName} is a licensed California landscape contractor (${siteConfig.license}), bonded and insured.`,
};

function estimateFaq(city: string) {
  return {
    q: `Do you give free estimates in ${city}?`,
    a: "Yes. We walk the property with you, usually within a week of your call, then send a written scope and price. There is no charge and no obligation.",
  };
}

export const serviceAreas: ServiceArea[] = [
  {
    slug: "granite-bay-landscaping",
    city: "Granite Bay",
    note: "Estate lots, decomposed-granite soil, and heritage oaks worth building around.",
    metaTitle: "Landscaping in Granite Bay, CA | Design, Hardscape & Tree Care",
    metaDescription:
      "Full-service landscaping in Granite Bay: design-build, flagstone patios, retaining walls, drainage, irrigation, and oak-safe tree care on estate lots. C-27 licensed. Call for a free on-site estimate.",
    headline: "Granite Bay landscaping, built around {{granite and oaks}}.",
    intro:
      "Large lots, shallow rock, and oaks older than the houses beside them. We design and build landscapes that work with all three — and look after them once they're in.",
    heroImage: {
      src: "/portfolio/flagstone-patio.jpg",
      alt: "Mortared flagstone patio with hand-cut joints, block-edged planting beds, and new lawn",
      caption: "Mortar-set flagstone patio — a recent Telford build",
    },
    conditionsHeading: "What the ground is like in Granite Bay",
    conditions: [
      {
        icon: Mountain,
        title: "Decomposed granite, and granite",
        body: "The soil drains fast and holds little, and solid rock is often a shovel's depth down. That changes how footings, trenches, and planting holes get dug — and what will actually grow.",
      },
      {
        icon: Trees,
        title: "Heritage oaks",
        body: "Blue, valley, and live oaks define the neighborhood and are easy to kill with a trench or a sprinkler in the wrong place. We plan grading and irrigation around the root zone and dig by hand near roots.",
      },
      {
        icon: Ruler,
        title: "Lots big enough to need a plan",
        body: "An acre gets built in phases. We lay out the whole property once — grades, drainage, utilities, planting — so the patio you build this year doesn't block the wall you want next year.",
      },
    ],
    services: [
      { href: "/#services", why: "One plan for the whole lot, built in phases by the same crew." },
      { href: "/portfolio?type=patios-stonework#work", why: "Mortar-set flagstone and stone paths that sit right beside granite outcrops." },
      { href: "/portfolio?type=walls-grading#work", why: "Usable flat ground out of sloping lots, with drainage behind every wall." },
      { href: "/plant-care", why: "Diagnosis and long-term care for mature oaks and specimen trees." },
      { href: "/fire-wise-landscaping", why: "Defensible space for homes near the lake and open oak woodland." },
      { href: "/irrigation", why: "Drip and smart timers matched to fast-draining soil, kept off oak roots." },
    ],
    work: ["flagstone-patio", "retaining-wall-90ft", "redwood-archway-gate"],
    neighborhoods: ["Los Lagos", "Wexford", "Treelake", "Hidden Valley", "Douglas Ranch", "Shelborne"],
    nearby: ["Folsom Lake area", "East Roseville", "Loomis"],
    faqs: [
      estimateFaq("Granite Bay"),
      {
        q: "Can you build near protected oaks?",
        a: "Yes. We keep trenches, footings, and grade changes out of the root zone where we can and hand-dig where we can't. If the work needs a tree permit, we tell you before anything starts.",
      },
      {
        q: "Are there rebates for replacing lawn in Granite Bay?",
        a: "Granite Bay is served by San Juan Water District, whose rebate programs open and close with funding. We check the current terms before you commit, and they generally need approval before any grass comes out — so call first.",
      },
      LICENSE_FAQ,
    ],
  },
  {
    slug: "loomis-landscaping",
    city: "Loomis",
    note: "Acreage and long property lines — fencing, gates, grading, and drainage at scale.",
    metaTitle: "Landscaping in Loomis, CA | Fencing, Drainage & Acreage Landscapes",
    metaDescription:
      "Landscaping for Loomis acreage and horse property: redwood fencing and gates, drainage and grading, retaining walls, defensible space, and low-water planting. C-27 licensed. Free on-site estimate.",
    headline: "Loomis landscaping for {{acreage}}, not just yards.",
    intro:
      "Long fence lines, seasonal creeks, and more ground than a mow-and-blow crew knows what to do with. We build for properties measured in acres: fencing, gates, drainage, grading, and planting that looks after itself.",
    heroImage: {
      src: "/portfolio/redwood-archway-gate.jpg",
      alt: "Custom redwood archway gate with forged iron hardware and post lighting under an oak canopy",
      caption: "Hand-cut redwood archway gate — a recent Telford build",
    },
    conditionsHeading: "What the ground is like in Loomis",
    conditions: [
      {
        icon: Fence,
        title: "Long property lines",
        body: "A fence that runs hundreds of feet shows every shortcut. We step runs to the grade, keep the cap line straight, and brace gates so they still swing square after a few seasons.",
      },
      {
        icon: Waves,
        title: "Winter water with nowhere to go",
        body: "Runoff crosses acreage on its way to the creeks, and it finds driveways, barns, and low corners first. We regrade, trench, and pipe it so it leaves on its own.",
      },
      {
        icon: Flame,
        title: "Grass, brush, and oak woodland",
        body: "Open land dries out every summer. We clear and replant the ground around the house so it's defensible and still looks like the country property you bought.",
      },
    ],
    services: [
      { href: "/portfolio?type=fences-gates#work", why: "Full perimeters, drive gates, and wire-infill fencing that keeps the view." },
      { href: "/drainage-trenching", why: "French drains, swales, and regrading for low ground and long driveways." },
      { href: "/portfolio?type=walls-grading#work", why: "Level, usable ground cut out of sloping acreage, with drainage built in." },
      { href: "/fire-wise-landscaping", why: "Defensible space around the house without stripping the property bare." },
      { href: "/native-low-maintenance", why: "Planting that covers a lot of ground and doesn't need a full-time gardener." },
      { href: "/irrigation", why: "Systems laid out for distance — long runs, many zones, one timer." },
    ],
    work: ["redwood-fence-line", "nature-fence-gate", "redwood-archway-gate"],
    neighborhoods: ["Sierra de Montserrat", "Sterling Pointe", "Clos du Lac", "Cambridge Estates", "Monte Claire", "Downtown Loomis"],
    nearby: ["Penryn", "Newcastle", "Rocklin"],
    faqs: [
      estimateFaq("Loomis"),
      {
        q: "Do you work on acreage and horse property?",
        a: "Yes. Long fence runs, drive and pasture gates, drainage, grading for level pads, and clearing around the house are all done in-house by the same crew.",
      },
      {
        q: "Can you fence a whole perimeter?",
        a: "Yes. We build full runs in redwood, privacy or picket, and redwood-framed welded wire where you want to contain animals and keep the view. Gates are built on site to the actual opening.",
      },
      LICENSE_FAQ,
    ],
  },
  {
    slug: "auburn-landscaping",
    city: "Auburn",
    note: "Slopes, red clay, and fire country: walls, stairs, and defensible space.",
    metaTitle: "Landscaping in Auburn, CA | Retaining Walls, Defensible Space & Decks",
    metaDescription:
      "Hillside landscaping in Auburn: retaining walls, stairs and decks, drainage, and fire-wise defensible space that still looks designed. C-27 licensed, bonded and insured. Free on-site estimate.",
    headline: "Auburn landscaping for {{slopes and fire country}}.",
    intro:
      "Most Auburn lots are tilted, most of the soil is red clay over rock, and wildfire is a fact of the address. We build the walls, stairs, and decks that make a hillside usable, and the defensible space that keeps it insurable.",
    heroImage: {
      src: "/portfolio/redwood-stairs-wall.jpg",
      alt: "Redwood staircase with railing beside a curved block retaining wall on a graded slope",
      caption: "Redwood stair and curved retaining wall — a recent Telford build",
    },
    conditionsHeading: "What the ground is like in Auburn",
    conditions: [
      {
        icon: Mountain,
        title: "Almost nothing is flat",
        body: "A slope you avoid is yard you're paying for and not using. Walls, terraces, and stairs turn it into ground you can walk, plant, and sit on.",
      },
      {
        icon: Shovel,
        title: "Red clay over rock",
        body: "It holds water all winter and sets like brick all summer. Walls need real drainage behind them and plants need soil that has been opened up, or both fail in a few seasons.",
      },
      {
        icon: Flame,
        title: "Fire hazard zones",
        body: "California requires up to 100 feet of defensible space in fire hazard areas, and insurers are checking. We do that work as landscape design, not as demolition.",
      },
    ],
    services: [
      { href: "/fire-wise-landscaping", why: "Defensible space planned zone by zone, with documentation you can hand an insurer." },
      { href: "/portfolio?type=walls-grading#work", why: "Retaining walls with compacted base and drainage, built for clay." },
      { href: "/portfolio?type=decks-carpentry#work", why: "Decks and stairs framed level over ground that isn't." },
      { href: "/drainage-trenching", why: "Water moved off the slope and away from the foundation before it does damage." },
      { href: "/native-low-maintenance", why: "Foothill natives that hold a bank and live on winter rain once established." },
      { href: "/portfolio?type=fences-gates#work", why: "Fence lines stepped evenly down a grade instead of following every dip." },
    ],
    work: ["redwood-stairs-wall", "retaining-wall-90ft", "timber-carport"],
    neighborhoods: ["Old Town Auburn", "North Auburn", "Bowman", "Christian Valley", "Auburn Valley"],
    nearby: ["Newcastle", "Meadow Vista", "Penryn"],
    faqs: [
      estimateFaq("Auburn"),
      {
        q: "Can you help with defensible space for my insurance?",
        a: "Yes. We clear, regrade, and replant the zones around the house to current defensible-space rules, and give you before-and-after documentation of the work. California's stricter rules for the first five feet around a home are on the way, and we design with them in mind.",
      },
      {
        q: "Do you build on steep lots?",
        a: "Yes — retaining walls, terraces, stairs, and decks on slopes are core work for us. Taller walls need engineering and a permit; we tell you up front which side of that line yours falls on.",
      },
      LICENSE_FAQ,
    ],
  },
  {
    slug: "roseville-landscaping",
    city: "Roseville",
    note: "Tighter lots on heavy clay — patios, drainage, and lawns converted to low-water yards.",
    metaTitle: "Landscaping in Roseville, CA | Lawn Conversion, Patios & Drainage",
    metaDescription:
      "Roseville landscaping: lawn-to-low-water conversions, flagstone patios, yard drainage for heavy clay, irrigation repair, and redwood fencing. C-27 licensed. Call or text for a free on-site estimate.",
    headline: "Roseville landscaping that makes {{every square foot}} count.",
    intro:
      "Roseville yards are smaller, flatter, and sitting on heavy clay. That calls for patios instead of unused lawn, drainage that works, and planting that looks good on a fraction of the water.",
    heroImage: {
      src: "/areas/low-water-front-yard.jpg",
      alt: "Low-water front yard with a dry creek bed of river cobble, gravel, mulched planting, and a flagstone path",
      caption: "Lawn replaced with a dry creek bed and low-water planting — a recent Telford build",
    },
    conditionsHeading: "What the ground is like in Roseville",
    conditions: [
      {
        icon: Shovel,
        title: "Heavy clay and hardpan",
        body: "Water sits on top instead of soaking in, so lawns go soggy and side yards stay wet. Drainage and soil preparation come before anything pretty.",
      },
      {
        icon: Home,
        title: "Neighbors on three sides",
        body: "On a tighter lot the fence, the patio, and the planting all have to do double duty: privacy, shade, and somewhere to sit, in a space you can cross in ten steps.",
      },
      {
        icon: Droplets,
        title: "Lawns that cost more than they give",
        body: "A front lawn nobody walks on is the easiest water saving there is. The City of Roseville's Cash for Grass program rebates conversions when it's funded.",
      },
    ],
    services: [
      { href: "/water-smart-landscaping", why: "Front lawns converted to low-water yards, with the rebate paperwork handled." },
      { href: "/portfolio?type=patios-stonework#work", why: "Patios and paths that turn a small back yard into a room." },
      { href: "/drainage-trenching", why: "French drains and regrading for clay that won't soak." },
      { href: "/irrigation", why: "Repairs, drip conversions, and smart timers for existing systems." },
      { href: "/portfolio?type=fences-gates#work", why: "Redwood privacy fencing built to last longer than the tract original." },
      { href: "/#services", why: "A full back-yard design and install, start to finish." },
    ],
    work: ["flagstone-patio", "nature-fence-gate", "redwood-fence-line"],
    neighborhoods: ["Morgan Creek", "Stoneridge", "Diamond Oaks", "Highland Reserve", "WestPark", "Fiddyment Farm", "Johnson Ranch", "Sun City Roseville"],
    nearby: ["Rocklin", "Granite Bay", "Lincoln"],
    faqs: [
      estimateFaq("Roseville"),
      {
        q: "Does Roseville pay you to replace your lawn?",
        a: "The City's Cash for Grass program rebates lawn-to-low-water conversions while funds last. Programs like it generally need approval before any grass is removed, so call us first — we check the current terms and handle the paperwork.",
      },
      {
        q: "My back yard floods every winter. Can that be fixed?",
        a: "Almost always. On Roseville clay it usually takes a combination of regrading so water runs away from the house and a French drain or catch basin to carry it out. We look at where the water comes from before recommending anything.",
      },
      LICENSE_FAQ,
    ],
  },
  {
    slug: "lincoln-landscaping",
    city: "Lincoln",
    note: "Newer homes with blank back yards, ready for a full design and install.",
    metaTitle: "Landscaping in Lincoln, CA | New-Home Back Yards, Patios & Drainage",
    metaDescription:
      "Landscaping in Lincoln, CA: complete back-yard design and install for new homes, patios, drainage and grading, low-water planting, and irrigation. C-27 licensed, bonded and insured. Free estimate.",
    headline: "Lincoln landscaping, from {{bare dirt}} to finished yard.",
    intro:
      "New homes in Lincoln come with a fence, a slab, and a rectangle of compacted clay. We take it from there: grading and drainage first, then patios, irrigation, and planting — one crew, one schedule.",
    heroImage: {
      src: "/portfolio/retaining-wall-90ft.jpg",
      alt: "Segmental block retaining wall creating a flat, graded back yard ready for landscaping",
      caption: "A back yard graded flat and ready to build on — a recent Telford build",
    },
    conditionsHeading: "What the ground is like in Lincoln",
    conditions: [
      {
        icon: Shovel,
        title: "Clay the town was built on",
        body: "Lincoln's clay has been fired into pottery since the 1870s. In a back yard it means slow drainage and hard digging, so soil preparation decides whether new plants live.",
      },
      {
        icon: Home,
        title: "Builder-grade starting points",
        body: "A new lot is usually compacted subsoil with little topsoil and no plan for where the water goes. Getting grade and drainage right first is what keeps a new patio from holding puddles.",
      },
      {
        icon: Ruler,
        title: "Association design standards",
        body: "Many Lincoln communities review landscape plans before work begins. We prepare the plan and plant list for that review, so approval doesn't hold up the build.",
      },
    ],
    services: [
      { href: "/#services", why: "A complete back yard — designed, graded, built, and planted in one pass." },
      { href: "/portfolio?type=patios-stonework#work", why: "Patios and paths set on a proper compacted base over clay." },
      { href: "/drainage-trenching", why: "Grading and drains put in before the hardscape, not after the first wet winter." },
      { href: "/water-smart-landscaping", why: "Low-water planting that fits a small lot and a hot summer." },
      { href: "/irrigation", why: "New drip and smart-timer systems, or builder irrigation finished properly." },
      { href: "/portfolio?type=walls-grading#work", why: "Low walls and raised beds that give a flat lot some shape." },
    ],
    work: ["retaining-wall-90ft", "flagstone-patio", "redwood-deck"],
    neighborhoods: ["Sun City Lincoln Hills", "Twelve Bridges", "Lincoln Crossing", "Catta Verdera", "Downtown Lincoln"],
    nearby: ["Rocklin", "Roseville", "Newcastle"],
    faqs: [
      estimateFaq("Lincoln"),
      {
        q: "We just bought a new home with a bare back yard. Where do we start?",
        a: "With a plan for the whole yard, then the things you can't easily change later: grade, drainage, and irrigation sleeves under where the patio will go. Hardscape follows, then planting. We do all of it, so nothing waits on another contractor.",
      },
      {
        q: "Do you work in Sun City Lincoln Hills?",
        a: "Yes. We design to the association's landscape standards and prepare the plan they review, whether it's a lawn conversion, a small patio, or an irrigation repair.",
      },
      LICENSE_FAQ,
    ],
  },
];

export function getServiceArea(slug: string): ServiceArea | undefined {
  return serviceAreas.find((a) => a.slug === slug);
}
