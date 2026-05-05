export default function Notes({ data }) {
  if (!data) return null;
  return (
    <div>
      <h2>Clinical Notes</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
