export default function Navbar(isLoggedIn: boolean = false) {
  return (
    <>
      {/* if user is logged in */}
      {isLoggedIn === true ? (
        <nav>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
          </ul>
        </nav>
      ) : (
        <nav>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/register">Register</a>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
