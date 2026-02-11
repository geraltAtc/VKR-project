import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root to the main tours catalogue
  redirect("/tours");
}
