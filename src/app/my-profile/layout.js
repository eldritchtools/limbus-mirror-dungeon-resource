import { Suspense } from "react";

export const metadata = {
    title: "My Profile | Limbus Company Mirror Dungeon Resource",
    description: "View the user's md plans or edit details"
};

export default function ProfileLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}