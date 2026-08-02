import UserResult from "./User";

export default function SearchResult() {
  return (
    <div className="mt-4">
      <UserResult
        name="John Doe"
        userId="12345"
        location="New York, USA"
        avatarUrl="https://example.com/avatar.jpg"
      />
      <UserResult
        name="John Doe"
        userId="12345"
        location="New York, USA"
        avatarUrl="https://example.com/avatar.jpg"
      />{" "}
      <UserResult
        name="John Doe"
        userId="12345"
        location="New York, USA"
        avatarUrl="https://example.com/avatar.jpg"
      />{" "}
      <UserResult
        name="John Doe"
        userId="12345"
        location="New York, USA"
        avatarUrl="https://example.com/avatar.jpg"
      />{" "}
      <UserResult
        name="John Doe"
        userId="12345"
        location="New York, USA"
        avatarUrl="https://example.com/avatar.jpg"
      />
      <p className="text-lg text-gray-600 z-0 text-center">
        Search results will be displayed here.
      </p>
    </div>
  );
}
