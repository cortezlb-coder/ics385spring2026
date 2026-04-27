const amenityHighlights = [
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

function Header({ property }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{property.name}</p>
        <h1>Stay close to the waves.</h1>
      </div>
      <nav className="topnav" aria-label="Page sections">
        <a href="#">Login</a>
        <a href="#about">About</a>
        <a href="#amenities">Amenities</a>
        <a href="#dashboard">Dashboard</a>
        <a href="#cta">Book</a>
      </nav>
    </header>
  );
}

function Hero({ property, loadState }) {
  const locationLabel = `${property.island}, Hawaii`;

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="kicker">{locationLabel}</p>
        <h2>{property.name} keeps the booking path simple.</h2>
        <p className="lede">{property.description}</p>
        <div className="actions">
          <a className="button primary" href="#cta">Book a Stay</a>
          <a className="button secondary" href="#dashboard">See Dashboard</a>
        </div>
        <div className="stats" aria-label="Property highlights">
          <div className="stat-card">
            <span>Location</span>
            <strong>{locationLabel}</strong>
          </div>
          <div className="stat-card">
            <span>Built for</span>
            <strong>{property.targetSegment}</strong>
          </div>
          <div className="stat-card">
            <span>Data</span>
            <strong>{loadState === "loaded" ? "Live backend fetch" : "Fallback preview"}</strong>
          </div>
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

function About({ property }) {
  return (
    <section className="panel about" id="about">
      <h3>About the stay</h3>
      <p>{property.description}</p>
      <div className="about-meta">
        <span>{`${property.island} location`}</span>
        <span>{property.targetSegment}</span>
      </div>
    </section>
  );
}

function Amenities({ property }) {
  return (
    <section className="panel amenities" id="amenities">
      <h3>Amenities</h3>
      <div className="amenity-list">
        {property.amenities.map((amenity, index) => {
          const highlight = amenityHighlights[index] || amenityHighlights[0];

          return (
            <article key={amenity} className="amenity-card">
              <div className="mark">{highlight.mark}</div>
              <div>
                <h4>{amenity}</h4>
                <p>{highlight.description}</p>
              </div>
            </article>
          );
        })}
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

export default function MarketingPage({ property, loadState }) {
  return (
    <>
      <Header property={property} />
      <Hero property={property} loadState={loadState} />
      <div className="content-grid">
        <About property={property} />
        <Amenities property={property} />
      </div>
      <CTA />
    </>
  );
}