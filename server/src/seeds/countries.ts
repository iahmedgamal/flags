import type { Knex } from "knex";

const COUNTRIES = [
  // Africa (heavy focus)
  { name: "Nigeria", capital: "Abuja", flag_url: "🇳🇬", continent: "Africa", region: "West Africa" },
  { name: "Egypt", capital: "Cairo", flag_url: "🇪🇬", continent: "Africa", region: "North Africa" },
  { name: "South Africa", capital: "Pretoria", flag_url: "🇿🇦", continent: "Africa", region: "Southern Africa" },
  { name: "Kenya", capital: "Nairobi", flag_url: "🇰🇪", continent: "Africa", region: "East Africa" },
  { name: "Ethiopia", capital: "Addis Ababa", flag_url: "🇪🇹", continent: "Africa", region: "East Africa" },
  { name: "Ghana", capital: "Accra", flag_url: "🇬🇭", continent: "Africa", region: "West Africa" },
  { name: "Morocco", capital: "Rabat", flag_url: "🇲🇦", continent: "Africa", region: "North Africa" },
  { name: "Tanzania", capital: "Dodoma", flag_url: "🇹🇿", continent: "Africa", region: "East Africa" },
  { name: "Algeria", capital: "Algiers", flag_url: "🇩🇿", continent: "Africa", region: "North Africa" },
  { name: "Uganda", capital: "Kampala", flag_url: "🇺🇬", continent: "Africa", region: "East Africa" },
  { name: "Senegal", capital: "Dakar", flag_url: "🇸🇳", continent: "Africa", region: "West Africa" },
  { name: "Rwanda", capital: "Kigali", flag_url: "🇷🇼", continent: "Africa", region: "East Africa" },
  { name: "Cameroon", capital: "Yaoundé", flag_url: "🇨🇲", continent: "Africa", region: "Central Africa" },
  { name: "Ivory Coast", capital: "Yamoussoukro", flag_url: "🇨🇮", continent: "Africa", region: "West Africa" },
  { name: "Madagascar", capital: "Antananarivo", flag_url: "🇲🇬", continent: "Africa", region: "East Africa" },
  { name: "Mozambique", capital: "Maputo", flag_url: "🇲🇿", continent: "Africa", region: "Southern Africa" },
  { name: "Tunisia", capital: "Tunis", flag_url: "🇹🇳", continent: "Africa", region: "North Africa" },
  { name: "Zambia", capital: "Lusaka", flag_url: "🇿🇲", continent: "Africa", region: "Southern Africa" },
  { name: "Zimbabwe", capital: "Harare", flag_url: "🇿🇼", continent: "Africa", region: "Southern Africa" },
  { name: "Mali", capital: "Bamako", flag_url: "🇲🇱", continent: "Africa", region: "West Africa" },
  { name: "Burkina Faso", capital: "Ouagadougou", flag_url: "🇧🇫", continent: "Africa", region: "West Africa" },
  { name: "Niger", capital: "Niamey", flag_url: "🇳🇪", continent: "Africa", region: "West Africa" },
  { name: "Chad", capital: "N'Djamena", flag_url: "🇹🇩", continent: "Africa", region: "Central Africa" },
  { name: "Somalia", capital: "Mogadishu", flag_url: "🇸🇴", continent: "Africa", region: "East Africa" },
  { name: "Democratic Republic of the Congo", capital: "Kinshasa", flag_url: "🇨🇩", continent: "Africa", region: "Central Africa" },
  { name: "Angola", capital: "Luanda", flag_url: "🇦🇴", continent: "Africa", region: "Southern Africa" },
  { name: "Namibia", capital: "Windhoek", flag_url: "🇳🇦", continent: "Africa", region: "Southern Africa" },
  { name: "Botswana", capital: "Gaborone", flag_url: "🇧🇼", continent: "Africa", region: "Southern Africa" },
  { name: "Liberia", capital: "Monrovia", flag_url: "🇱🇷", continent: "Africa", region: "West Africa" },
  { name: "Sierra Leone", capital: "Freetown", flag_url: "🇸🇱", continent: "Africa", region: "West Africa" },

  // Europe
  { name: "France", capital: "Paris", flag_url: "🇫🇷", continent: "Europe", region: "Western Europe" },
  { name: "Germany", capital: "Berlin", flag_url: "🇩🇪", continent: "Europe", region: "Western Europe" },
  { name: "United Kingdom", capital: "London", flag_url: "🇬🇧", continent: "Europe", region: "Western Europe" },
  { name: "Italy", capital: "Rome", flag_url: "🇮🇹", continent: "Europe", region: "Southern Europe" },
  { name: "Spain", capital: "Madrid", flag_url: "🇪🇸", continent: "Europe", region: "Southern Europe" },
  { name: "Portugal", capital: "Lisbon", flag_url: "🇵🇹", continent: "Europe", region: "Southern Europe" },
  { name: "Netherlands", capital: "Amsterdam", flag_url: "🇳🇱", continent: "Europe", region: "Western Europe" },
  { name: "Sweden", capital: "Stockholm", flag_url: "🇸🇪", continent: "Europe", region: "Northern Europe" },
  { name: "Norway", capital: "Oslo", flag_url: "🇳🇴", continent: "Europe", region: "Northern Europe" },
  { name: "Poland", capital: "Warsaw", flag_url: "🇵🇱", continent: "Europe", region: "Eastern Europe" },

  // Asia
  { name: "Japan", capital: "Tokyo", flag_url: "🇯🇵", continent: "Asia", region: "East Asia" },
  { name: "South Korea", capital: "Seoul", flag_url: "🇰🇷", continent: "Asia", region: "East Asia" },
  { name: "India", capital: "New Delhi", flag_url: "🇮🇳", continent: "Asia", region: "South Asia" },
  { name: "China", capital: "Beijing", flag_url: "🇨🇳", continent: "Asia", region: "East Asia" },
  { name: "Thailand", capital: "Bangkok", flag_url: "🇹🇭", continent: "Asia", region: "Southeast Asia" },
  { name: "Vietnam", capital: "Hanoi", flag_url: "🇻🇳", continent: "Asia", region: "Southeast Asia" },
  { name: "Indonesia", capital: "Jakarta", flag_url: "🇮🇩", continent: "Asia", region: "Southeast Asia" },
  { name: "Turkey", capital: "Ankara", flag_url: "🇹🇷", continent: "Asia", region: "Western Asia" },
  { name: "Saudi Arabia", capital: "Riyadh", flag_url: "🇸🇦", continent: "Asia", region: "Western Asia" },
  { name: "Philippines", capital: "Manila", flag_url: "🇵🇭", continent: "Asia", region: "Southeast Asia" },

  // Americas
  { name: "United States", capital: "Washington, D.C.", flag_url: "🇺🇸", continent: "North America", region: null },
  { name: "Canada", capital: "Ottawa", flag_url: "🇨🇦", continent: "North America", region: null },
  { name: "Mexico", capital: "Mexico City", flag_url: "🇲🇽", continent: "North America", region: null },
  { name: "Brazil", capital: "Brasília", flag_url: "🇧🇷", continent: "South America", region: null },
  { name: "Argentina", capital: "Buenos Aires", flag_url: "🇦🇷", continent: "South America", region: null },
  { name: "Colombia", capital: "Bogotá", flag_url: "🇨🇴", continent: "South America", region: null },
  { name: "Peru", capital: "Lima", flag_url: "🇵🇪", continent: "South America", region: null },
  { name: "Chile", capital: "Santiago", flag_url: "🇨🇱", continent: "South America", region: null },

  // Oceania
  { name: "Australia", capital: "Canberra", flag_url: "🇦🇺", continent: "Oceania", region: null },
  { name: "New Zealand", capital: "Wellington", flag_url: "🇳🇿", continent: "Oceania", region: null },
];

export async function seed(knex: Knex): Promise<void> {
  await knex("countries").del();
  await knex("countries").insert(COUNTRIES);
}
