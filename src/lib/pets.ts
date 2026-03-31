export async function fetchMyPet() {
  const res = await fetch("/api/pets/me");
  if (!res.ok) return null;
  const data = await res.json();
  return data.pet;
}
