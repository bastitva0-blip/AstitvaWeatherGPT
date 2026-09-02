export function GlobalRadar() {
  return (
    <div className="global-radar" aria-hidden="true">
      <div className="global-radar__ring global-radar__ring--outer" />
      <div className="global-radar__ring global-radar__ring--inner" />
      <div className="global-radar__sweep" />
    </div>
  );
}
