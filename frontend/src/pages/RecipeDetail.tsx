import Layout from '~/components/Layout';

function RecipeDetail() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h1 className="text-text text-3xl font-semibold">Recept</h1>
        <p className="text-text text-lg brightness-80">A recept részletei itt fognak megjelenni.</p>
      </div>
    </Layout>
  );
}

export default RecipeDetail;
