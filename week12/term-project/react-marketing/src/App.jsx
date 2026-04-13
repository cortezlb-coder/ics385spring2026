const stats = [
  { label: "Location", value: "Kihei, Maui" },
  { label: "Built for", value: "Australian surfers" },
  { label: "Focus", value: "Fast booking" }
];

const amenities = [
  {
    title: "Surfboard storage and board rental support",
    description: "Keep gear safe, dry, and ready for dawn patrol.",
    mark: "01"
  },
  {
    title: "Outdoor shower",
    description: "Rinse off sand and salt before heading back in.",
    mark: "02"
  },
  {
    title: "Jeep or Tacoma rental options",
    description: "Move boards and beach gear around the island with ease.",
    mark: "03"
  }
];

function Header() {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Maui Surf House</p>
        <h1>Stay close to the waves.</h1>
      </div>
      <nav className="topnav" aria-label="Page sections">
        <a href="#about">About</a>
        <a href="#amenities">Amenities</a>
        <a href="#cta">Book</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="kicker">Kihei, Maui</p>
        <h2>A surf-friendly stay for Australian visitors who want a simple, clean base.</h2>
        <p className="lede">
          Maui Surf House is set up for surfers who want a clear booking path, practical beach
          amenities, and a place that feels easy from the first click.
        </p>
        <div className="actions">
          <a className="button primary" href="#cta">Book a Stay</a>
          <a className="button secondary" href="#amenities">See Amenities</a>
        </div>
        <div className="stats" aria-label="Property highlights">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="visual-panel">
          <div className="visual-badge">Featured image</div>
          <p>Ocean view, warm light, and a direct path to booking.</p>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="panel about" id="about">
      <h3>About the stay</h3>
      <p>
        Maui Surf House is built around a simple idea: give visiting surfers a place in Kihei that
        is easy to understand, easy to book, and built around the gear and routines that matter
        after a day in the water.
      </p>
    </section>
  );
}

function Amenities() {
  return (
    <section className="panel amenities" id="amenities">
      <h3>Amenities</h3>
      <div className="amenity-list">
        {amenities.map((amenity) => (
          <article key={amenity.title} className="amenity-card">
            <div className="mark">{amenity.mark}</div>
            <div>
              <h4>{amenity.title}</h4>
              <p>{amenity.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="cta" id="cta">
      <p className="eyebrow light">Next step</p>
      <h3>Ready to book your Maui surf trip?</h3>
      <p>
        The page keeps the message direct: show the stay, show the surf support, and let the user
        move to booking without extra noise.
      </p>
      <a className="button primary" href="/booking">Check Availability</a>
    </section>
  );
}

export default function App() {
  return (
    <main className="page-shell">
      <Header />
      <Hero />
      <div className="content-grid">
        <About />
        <Amenities />
      </div>
      <CTA />
    </main>
  );
}
