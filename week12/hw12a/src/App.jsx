import Header from "./Header.jsx";
import IslandCard from "./IslandCard.jsx";

const islands = [
  {
    id: 1,
    name: "Maui",
    description:
      "Known as the Valley Isle, Maui is famous for the Road to Hana and Haleakala National Park.",
    tip: "Reserve sunrise entry at Haleakala early and arrive at least 30 minutes before your time slot.",
  },
  {
    id: 2,
    name: "Oahu",
    description:
      "Home to Honolulu, Waikiki Beach, and Pearl Harbor, Oahu blends city life with surf culture.",
    tip: "Use TheBus for affordable transportation around the island and avoid parking headaches.",
  },
  {
    id: 3,
    name: "Kauai",
    description:
      "The Garden Isle is known for dramatic cliffs along the Na Pali Coast and Waimea Canyon.",
    tip: "Book Na Pali tours in advance since top boat and hiking options fill up quickly.",
  },
];

function App() {
  return (
    <main className="app">
      <Header />
      <section className="card-grid">
        {islands.map((island) => (
          <IslandCard
            key={island.id}
            name={island.name}
            description={island.description}
            tip={island.tip}
          />
        ))}
      </section>
    </main>
  );
}

export default App;
