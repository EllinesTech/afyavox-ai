export default function Transcript({ text }) {
  if (!text) return null;
  return (
    <div>
      <h2>Transcript</h2>
      <p>{text}</p>
    </div>
  );
}
