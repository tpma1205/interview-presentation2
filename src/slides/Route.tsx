/** 路線圖：以一條主線串接各站，表示依序推進的階段；站名中的 \n 為指定斷行處 */
export function Route({ stops }: { stops: { title: string }[] }) {
  return (
    <ol className="route" style={{ ['--stops' as string]: stops.length }}>
      {stops.map((s) => (
        <li key={s.title} className="route-stop">
          <span className="dot" aria-hidden />
          <h3>{s.title}</h3>
        </li>
      ))}
    </ol>
  );
}
