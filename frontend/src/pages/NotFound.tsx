import { Link } from 'react-router-dom';
import { EmptyState } from '~/components/ui';

function NotFound() {
  return (
    <div>
      <EmptyState message="Nem található" />
      <Link to="/">Vissza a főoldalra</Link>
    </div>
  );
}

export default NotFound;
