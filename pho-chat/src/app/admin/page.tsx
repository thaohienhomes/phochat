"use client";



import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AdminPage() {
  const isTeamMember = useQuery(api.users.isTeamMember);

  if (isTeamMember === undefined) {
    return <div>Loading...</div>;
  }

  if (!isTeamMember) {
    return <div>You do not have permission to view this page.</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin dashboard!</p>
    </div>
  );
}
