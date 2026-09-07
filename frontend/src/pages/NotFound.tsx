import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div>
      <h1>Nem található</h1>
      <Link to="/">Vissza a főoldalra</Link>
    </div>
  );
}

export default NotFound;
