import { useState } from "react";

const amenityDescriptions = {
  "WiFi": "Stay connected to check the surf report or share photos from the beach.",
  "Surfboard storage": "Keep gear safe, dry, and ready for dawn patrol.",
  "Surfboard storage and board rental support": "Keep gear safe, dry, and ready for dawn patrol.",
  "Outdoor shower": "Rinse off sand and salt before heading back inside.",
  "Parking": "Park your rental Jeep or Tacoma right at the house, no street hunting.",
  "Washer": "Wash salty wetsuits and towels between surf sessions.",
  "Jeep or Tacoma rental available": "Move boards and beach gear around the island with ease.",
  "Jeep or Tacoma rental options": "Move boards and beach gear around the island with ease."
};

const defaultAmenityDescription = "One more way this stay is set up for surfers.";

const fallbackImageUrl = "/maui-surf-house.jpg";

function Header({ property }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{property.name}</p>
        <h1>Stay close to the waves.</h1>
      </div>
      <nav className="topnav" aria-label="Page sections">
        <a href="#login">Log in</a>
        <a href="#about">About</a>
        <a href="#amenities">Amenities</a>
        <a href="#dashboard">Dashboard</a>
        <a href="#cta">Book</a>
      </nav>
    </header>
  );
}

function Hero({ property, loadState, onBook }) {
  const locationLabel = `${property.island}, Hawaii`;
  const imageUrl = fallbackImageUrl;

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="kicker">{locationLabel}</p>
        <h2>{property.name} keeps the booking path simple.</h2>
        <p className="lede">{property.description}</p>
        <div className="actions">
          <button className="button primary" onClick={onBook} type="button">Book a Stay</button>
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

      <div
        className="hero-visual"
        style={{ "--hero-image": `url("${imageUrl}")` }}
        aria-label={`${property.name} featured image`}
        role="img"
      >
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
          const description = amenityDescriptions[amenity] || defaultAmenityDescription;
          const mark = String(index + 1).padStart(2, "0");

          return (
            <article key={amenity} className="amenity-card">
              <div className="mark">{mark}</div>
              <div>
                <h4>{amenity}</h4>
                <p>{description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CTA({ onBook }) {
  return (
    <section className="cta" id="cta">
      <p className="eyebrow light">Next step</p>
      <h3>Ready to book your Maui surf trip?</h3>
      <p>
        The page keeps the message direct: show the stay, show the surf support, and let the user
        move to booking without extra noise.
      </p>
      <button className="button primary" onClick={onBook} type="button">Check Availability</button>
    </section>
  );
}

export default function MarketingPage({ property, loadState }) {
  const [showBookingNotice, setShowBookingNotice] = useState(false);

  return (
    <>
      <Header property={property} />
      <Hero property={property} loadState={loadState} onBook={() => setShowBookingNotice(true)} />
      <div className="content-grid">
        <About property={property} />
        <Amenities property={property} />
      </div>
      <CTA onBook={() => setShowBookingNotice(true)} />
      {showBookingNotice && (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowBookingNotice(false)}>
          <section
            aria-labelledby="booking-notice-title"
            aria-modal="true"
            className="booking-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Close booking notice"
              className="modal-close"
              onClick={() => setShowBookingNotice(false)}
              type="button"
            >
              ×
            </button>
            <p className="eyebrow">Booking update</p>
            <h2 id="booking-notice-title">Appointments are under construction.</h2>
            <p>
              Online booking is not available yet. Email me and I will help arrange your Maui surf stay.
            </p>
            <a className="button primary" href="mailto:cortezlb@hawaii.edu?subject=Maui%20Surf%20House%20appointment">
              Email me
            </a>
          </section>
        </div>
      )}
    </>
  );
}