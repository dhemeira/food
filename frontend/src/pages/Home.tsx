import Layout from '~/components/Layout';

function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h1 className="text-text text-4xl font-semibold">Receptek</h1>
        <p className="text-text-muted text-lg">A receptlista itt fog megjelenni.</p>
      </div>
    </Layout>
  );
}

export default Home;
