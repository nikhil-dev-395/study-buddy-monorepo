import UserResult from "./User";
import dummyUsers from "../../../data/search/user/user.json";

export default function SearchResult() {
  return (
    <div className="mt-6 flex flex-col gap-4 max-w-md mx-auto">
      {dummyUsers.map((user) => (
        <UserResult
          key={user.id}
          userId={user.id}
          name={user.name}
          avatarUrl={user.avatarUrl}
          bio={user.bio}
          location={user.location}
          // Safely access nested academic details for students
          institution={user.academicDetails?.institution}
          major={user.academicDetails?.major}
          year={user.academicDetails?.year}
          // Safely access nested study preferences
          subjects={user.studyPreferences?.subjects}
          mode={
            user.studyPreferences?.mode as "online" | "in-person" | "hybrid"
          }
          isSearching={user.status?.isSearching}
        />
      ))}
    </div>
  );
}
