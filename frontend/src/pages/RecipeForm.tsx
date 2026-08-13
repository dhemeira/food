import Layout from '~/components/Layout';

function RecipeForm() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h1 className="text-text text-3xl font-semibold">Recept szerkesztése</h1>
        <p className="text-text text-lg brightness-80">A recept űrlap itt fog megjelenni.</p>
      </div>
    </Layout>
  );
}

export default RecipeForm;
