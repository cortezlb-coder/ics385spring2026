function IslandCard({ name, description, tip }) {
  return (
    <article className="island-card">
      <h2>{name}</h2>
      <p>{description}</p>
      <p className="tip">Visitor Tip: {tip}</p>
    </article>
  );
}

export default IslandCard;
