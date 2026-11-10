import { Link } from 'react-router-dom';
import { EmptyState } from '@dhemeira/ui';
import { useDocumentTitle } from '~/hooks/useDocumentTitle';

function NotFound() {
  useDocumentTitle('Nem található');

  return (
    <div>
      <EmptyState message="Nem található" />
      <Link to="/">Vissza a főoldalra</Link>
    </div>
  );
}

export default NotFound;
