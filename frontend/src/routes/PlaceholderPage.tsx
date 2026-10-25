type PlaceholderPageProps = {
  title: string;
};

export default function PlaceholderPage({
  title,
}: PlaceholderPageProps) {
  return (
    <main style={{ padding: "32px", fontFamily: "sans-serif" }}>
      <h1>{title}</h1>
      <p>This page is under development.</p>
    </main>
  );
}