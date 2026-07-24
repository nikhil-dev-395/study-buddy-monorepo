import { Link } from "react-router-dom";

export default function Error404() {
  return (
    <>
      <h1>404</h1>
      <h2> page not found</h2>
      <Link to="/">Go to home page</Link>
      <Link to="/login">Go to login page</Link>
    </>
  );
}
