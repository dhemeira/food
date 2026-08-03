import Layout from '~/components/Layout';

function RecipeDetail() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h1 className="text-text text-3xl font-semibold">Recept</h1>
        <p className="text-text-muted text-lg">A recept részletei itt fognak megjelenni.</p>
      </div>
    </Layout>
  );
}

export default RecipeDetail;
