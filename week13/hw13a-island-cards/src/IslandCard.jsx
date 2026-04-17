export default function IslandCard({ name, nickname, segment, avgStay, img }) {
  return (
    <article className="island-card">
      <img className="island-image" src={img} alt={`${name} - ${nickname} island photo`} />
      <div className="island-card-body">
        <div className="card-header">
          <h2>{name}</h2>
          <span className="segment-badge">{segment}</span>
        </div>
        <p className="nickname">{nickname}</p>
        <p className="avg-stay">Average stay: {avgStay.toFixed(1)} days</p>
      </div>
    </article>
  );
}
